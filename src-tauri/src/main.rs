// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chrono::{Duration, Utc};
use futures_util::StreamExt;
use shiplift::{tty::TtyChunk, Docker, LogsOptions};
use shiplift::{ContainerFilter, ContainerListOptions};
use std::collections::HashMap;
use tauri::Manager;
use tokio::sync::mpsc;
use tokio::sync::Mutex;

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
    container_id: String,
}

struct AsyncProps {
    logs_sender: Mutex<mpsc::Sender<String>>,
    container_logging: Mutex<HashMap<String, String>>,
}

async fn print_chunk(chunk: TtyChunk, logs_sender: &mpsc::Sender<String>, container_id: String) {
    match chunk {
        TtyChunk::StdOut(bytes) => {
            let message_string = std::str::from_utf8(&bytes).unwrap();

            let payload = Payload {
                message: message_string.to_string(),
                container_id: container_id,
            };

            let res = logs_sender
                .send(format!(
                    "{}",
                    serde_json::to_string_pretty(&payload).unwrap()
                ))
                .await;

            if res.is_err() {
                eprintln!("Error while sending the message {}", res.err().unwrap());
            }
        }
        TtyChunk::StdErr(bytes) => eprintln!("Error: {}", std::str::from_utf8(&bytes).unwrap()),
        TtyChunk::StdIn(_) => unreachable!(),
    }
}

fn send_to_front<R: tauri::Runtime>(message: String, manager: &impl Manager<R>) {
    manager.emit_all("logs", format!("{}", message)).unwrap();
}

#[tauri::command]
async fn get_containers() -> Result<String, String> {
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
async fn get_logs(
    container_id: String,
    invoke_id: u32,
    state: tauri::State<'_, AsyncProps>,
) -> Result<(), &'static str> {
    let mut container_hashmap = state.container_logging.lock().await;
    // the container is already putting log in the message stream
    if container_hashmap.contains_key(&container_id) {
        println!(
            "Container id: {} (req: {}) is already in the message stream",
            container_id, invoke_id
        );
        return Err("Already logging this container");
    }

    // set the container id in the hashmap and release the Mutex
    container_hashmap.insert(container_id.clone(), "running".into());
    std::mem::drop(container_hashmap);

    let docker = Docker::new();

    let mut logs_stream = docker.containers().get(&container_id).logs(
        &LogsOptions::builder()
            .stdout(true)
            .tail("500")
            .timestamps(true)
            .stderr(true)
            .follow(true)
            .build(),
    );

    while let Some(log_result) = logs_stream.next().await {
        let logs_sender = state.logs_sender.lock().await;
        match log_result {
            Ok(chunk) => print_chunk(chunk, &logs_sender, container_id.clone()).await,
            Err(e) => eprintln!("Error: {}", e),
        }
    }

    Ok(())
}

fn main() {
    let container_logging: HashMap<String, String> = HashMap::new();
    let (logs_channel_sender, mut logs_channel_receiver) = mpsc::channel(1);

    tauri::Builder::default()
        .manage(AsyncProps {
            logs_sender: Mutex::new(logs_channel_sender),
            container_logging: Mutex::new(container_logging),
        })
        .invoke_handler(tauri::generate_handler![get_containers, get_logs])
        .setup(|app| {
            let handle = app.handle();

            // logs thread
            tauri::async_runtime::spawn(async move {
                loop {
                    if let Some(output) = logs_channel_receiver.recv().await {
                        send_to_front(output, &handle);
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("failed to run the app");
}
