use std::collections::HashMap;
use std::sync::Arc;

use futures_util::StreamExt;
use log::{error, info, trace, warn};
use shiplift::{tty::TtyChunk, Docker, LogsOptions};
use shiplift::{ContainerFilter, ContainerListOptions};
use tauri::async_runtime::Sender;
use tokio::sync::{mpsc, Mutex};

use crate::tower::manager::{ThreadIdentifier, TowerManager};
use crate::tower::message::AbstractMessage;

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
    container_id: String,
}

async fn serialize_chunk(
    chunk: TtyChunk,
    logs_sender: &mpsc::Sender<AbstractMessage>,
    container_id: String,
) {
    match chunk {
        TtyChunk::StdOut(bytes) | TtyChunk::StdErr(bytes) => {
            let message_string = std::str::from_utf8(&bytes).unwrap();

            let payload = AbstractMessage {
                payload: message_string.to_string(),
                destination: container_id.clone(),
                topic: "CONTAINERS".to_string(),
            };

            trace!("sending logs to front end");

            let res = logs_sender.send(payload).await;

            if res.is_err() {
                error!("Error while sending the message {}", res.err().unwrap());
            }
        }
        TtyChunk::StdIn(_) => unreachable!(),
    }
}

#[tauri::command]
pub async fn get_containers() -> Result<String, String> {
    trace!("getting all docker containers");

    let docker: Docker = Docker::new();

    let containers = docker
        .containers()
        .list(
            &ContainerListOptions::builder()
                .all()
                .filter(vec![ContainerFilter::Status("running".into())])
                .build(),
        )
        .await;

    Ok(serde_json::to_string_pretty(&containers.unwrap()).unwrap())
}

#[tauri::command]
pub async fn get_logs(
    container_id: String,
    state: tauri::State<'_, TowerManager>,
) -> Result<(), &'static str> {
    info!("subscribing to logs for container_id {}", container_id);
    let thread_id = ThreadIdentifier {
        topic: crate::tower::manager::ThreadTopics::CONTAINERS,
        element: container_id.clone(),
    };

    let mut container_hashmap = state.thread_handles.lock().await;

    let messages = state.message_queue.clone();
    let threads = state.thread_handles.clone();

    if container_hashmap.contains_key(&thread_id) && *container_hashmap.get(&thread_id).unwrap() {
        warn!("container_id {} is already logging", container_id);
        return Err("Already logging this container");
    }

    container_hashmap.insert(thread_id, true);
    drop(container_hashmap);

    // spawn a new thread, made it listen to the docker logs
    tauri::async_runtime::spawn(async move {
        trace!("launch new docker logging thread");
        get_logs_thread_function(container_id.clone(), messages, threads).await
    });

    Ok(())
}

#[tauri::command]
pub async fn stop_get_logs(
    container_id: String,
    state: tauri::State<'_, TowerManager>,
) -> Result<(), &'static str> {
    info!("stop logs for container {}", container_id);
    let thread_id = ThreadIdentifier {
        topic: crate::tower::manager::ThreadTopics::CONTAINERS,
        element: container_id.clone(),
    };

    let mut threads = state.thread_handles.lock().await;

    threads.insert(thread_id, false);

    Ok(())
}

async fn get_logs_thread_function(
    container_id: String,
    message_arc: Arc<Mutex<Sender<AbstractMessage>>>,
    threads: Arc<Mutex<HashMap<ThreadIdentifier, bool>>>,
) {
    info!("get logs for container_id {}", container_id);
    let container_id = container_id.clone();
    let docker = Docker::new();

    let mut logs_stream = docker.containers().get(container_id.clone()).logs(
        &LogsOptions::builder()
            .stdout(true)
            .tail("500")
            .stderr(true)
            .follow(true)
            .build(),
    );

    let thread_id = ThreadIdentifier {
        topic: crate::tower::manager::ThreadTopics::CONTAINERS,
        element: container_id.clone(),
    };

    while let Some(log_result) = logs_stream.next().await {
        // check if the thread is terminated or not
        let thread_handles = threads.lock().await;
        let thread_is_alive = thread_handles.get(&thread_id).unwrap();

        if !*thread_is_alive {
            info!(
                "killing thread allocated to logs of container_id {}",
                container_id
            );
            break;
        }

        let logs_sender = message_arc.lock().await;

        match log_result {
            Ok(chunk) => serialize_chunk(chunk, &logs_sender, thread_id.element.clone()).await,
            Err(e) => error!("Error: {}", e),
        }
    }
}
