use futures_util::StreamExt;
use k8s_openapi::api::{
    apps::v1::Deployment,
    core::v1::{Namespace, Pod, Service},
};
use kube::{
    api::{Api, ListParams, LogParams},
    Client,
};
use log::{error, info, trace, warn};
use std::{collections::HashMap, sync::Arc};
use tauri::async_runtime::Sender;
use tokio::sync::Mutex;

use crate::tower::{
    manager::{ThreadIdentifier, TowerManager},
    message::AbstractMessage,
};

#[tauri::command]
pub async fn get_pods(namespace: String) -> Result<String, &'static str> {
    trace!("getting all pods in ns {}", namespace);

    let client = Client::try_default().await.unwrap();
    let pods: Api<Pod> = Api::namespaced(client, &namespace);
    let lp = ListParams::default();
    let all_pods = pods.list(&lp).await.unwrap();

    Ok(serde_json::to_string_pretty(&all_pods.items).unwrap())
}

#[tauri::command]
pub async fn get_services(namespace: String) -> Result<String, &'static str> {
    trace!("getting all services in ns {}", namespace);

    let client = Client::try_default().await.unwrap();
    let services: Api<Service> = Api::default_namespaced(client);
    let lp = ListParams::default();
    let all_services = services.list(&lp).await.unwrap();

    Ok(serde_json::to_string_pretty(&all_services.items).unwrap())
}

#[tauri::command]
pub async fn get_namespaces() -> Result<String, &'static str> {
    trace!("getting all namespaces");

    let client = Client::try_default().await.unwrap();
    let services: Api<Namespace> = Api::all(client);
    let lp = ListParams::default();
    let all_namespaces = services.list(&lp).await.unwrap();

    Ok(serde_json::to_string_pretty(&all_namespaces.items).unwrap())
}

#[tauri::command]
pub async fn get_deployments(namespace: String) -> Result<String, &'static str> {
    trace!("getting all deployments in ns {}", namespace);

    let client = Client::try_default().await.unwrap();
    let deployments: Api<Deployment> = Api::default_namespaced(client);
    let lp = ListParams::default();
    let all_deployments = deployments.list(&lp).await.unwrap();

    Ok(serde_json::to_string_pretty(&all_deployments.items).unwrap())
}

#[tauri::command]
pub async fn get_pods_logs(
    pods_id: String,
    namespace: String,
    state: tauri::State<'_, TowerManager>,
) -> Result<(), &'static str> {
    info!("subscribing to logs for pods {}", pods_id);
    let thread_id = ThreadIdentifier {
        topic: crate::tower::manager::ThreadTopics::PODS,
        element: pods_id.clone(),
    };

    let mut container_hashmap = state.thread_handles.lock().await;

    let messages = state.message_queue.clone();
    let threads = state.thread_handles.clone();

    if container_hashmap.contains_key(&thread_id) && *container_hashmap.get(&thread_id).unwrap() {
        warn!("pods_id {} is already logging", pods_id);
        return Err("Already logging this pods");
    }

    container_hashmap.insert(thread_id, true);
    drop(container_hashmap);

    // spawn a new thread, made it listen to the docker logs
    tauri::async_runtime::spawn(async move {
        trace!("launch new kubernetes pods logging thread");
        get_logs_thread_function(pods_id.clone(), namespace, messages, threads).await
    });

    Ok(())
}

#[tauri::command]
pub async fn stop_pods_logs(
    pods_id: String,
    state: tauri::State<'_, TowerManager>,
) -> Result<(), &'static str> {
    info!("stop logs for container {}", pods_id);
    let thread_id = ThreadIdentifier {
        topic: crate::tower::manager::ThreadTopics::PODS,
        element: pods_id.clone(),
    };

    let mut threads = state.thread_handles.lock().await;

    threads.insert(thread_id, false);

    Ok(())
}

async fn get_logs_thread_function(
    pods_id: String,
    namespace: String,
    message_arc: Arc<Mutex<Sender<AbstractMessage>>>,
    threads: Arc<Mutex<HashMap<ThreadIdentifier, bool>>>,
) {
    info!("get logs for container_id {} in ns {}", pods_id, namespace);
    let container_id = pods_id.clone();

    let thread_id = ThreadIdentifier {
        topic: crate::tower::manager::ThreadTopics::PODS,
        element: container_id.clone(),
    };

    let client = Client::try_default().await.unwrap();
    let pods: Api<Pod> = Api::namespaced(client, &namespace);

    let mut logs = pods
        .log_stream(
            &pods_id,
            &LogParams {
                follow: true,
                tail_lines: Some(500),
                ..LogParams::default()
            },
        )
        .await
        .unwrap();

    let pod = pods.get(&pods_id).await.unwrap();
    let pod_uid = pod.metadata.uid.unwrap();

    while let Some(log_result) = logs.next().await {
        // check if the thread is terminated or not
        let thread_handles = threads.lock().await;
        let thread_is_alive = thread_handles.get(&thread_id).unwrap();

        if !*thread_is_alive {
            info!(
                "killing thread allocated to logs of pods_id {}",
                container_id
            );
            break;
        }

        drop(thread_handles);

        let logs_sender = message_arc.lock().await;

        match log_result {
            Ok(chunk) => {
                let message_string = std::str::from_utf8(&chunk).unwrap();

                let payload = AbstractMessage {
                    payload: message_string.to_string(),
                    destination: pod_uid.clone(),
                    topic: "PODS".to_string(),
                };

                trace!("sending logs to front end");

                let res = logs_sender.send(payload).await;

                if res.is_err() {
                    error!("Error while sending the message {}", res.err().unwrap());
                }
            }
            Err(e) => error!("Error: {}", e),
        }
    }
}
