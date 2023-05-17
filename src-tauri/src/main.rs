// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::thread::sleep;
use std::time::Duration;

use futures_util::StreamExt;
use shiplift::{tty::TtyChunk, Docker, LogsOptions};
use shiplift::{ContainerFilter, ContainerListOptions};
use tauri::Manager;
use tokio::sync::mpsc;
use tokio::sync::Mutex;
use tracing::info;

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

struct AsyncProps {
    inner: Mutex<mpsc::Sender<String>>,
}

#[tauri::command]
async fn js2rs(message: String, state: tauri::State<'_, AsyncProps>) -> Result<(), String> {
    info!(?message, "js2rs");
    let async_proc_input_tx = state.inner.lock().await;
    async_proc_input_tx
        .send(message)
        .await
        .map_err(|e| e.to_string())
}

async fn print_chunk(chunk: TtyChunk, output_tx: &mpsc::Sender<String>) {
    match chunk {
        TtyChunk::StdOut(bytes) => {
            output_tx
                .send(format!("Stdout: {}", std::str::from_utf8(&bytes).unwrap()))
                .await;
        }
        TtyChunk::StdErr(bytes) => eprintln!("Stdout: {}", std::str::from_utf8(&bytes).unwrap()),
        TtyChunk::StdIn(_) => unreachable!(),
    }
}

fn rs2js<R: tauri::Runtime>(message: String, manager: &impl Manager<R>) {
    info!(?message, "rs2js");
    manager.emit_all("rs2js", format!("{}", message)).unwrap();
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
async fn get_logs(id: String, state: tauri::State<'_, AsyncProps>) -> Result<(), String> {
    println!("get logs for id: {}", id);
    let docker = Docker::new();

    let mut logs_stream = docker.containers().get(id).logs(
        &LogsOptions::builder()
            .stdout(true)
            .stderr(true)
            .follow(true)
            .build(),
    );

    while let Some(log_result) = logs_stream.next().await {
        println!("getting logs");
        let output_tx = state.inner.lock().await;
        match log_result {
            Ok(chunk) => print_chunk(chunk, &output_tx).await,
            Err(e) => eprintln!("Error: {}", e),
        }
    }

    Ok(())
}

fn main() {
    let (async_proc_output_tx, mut async_proc_output_rx) = mpsc::channel(1);

    tauri::Builder::default()
        .manage(AsyncProps {
            inner: Mutex::new(async_proc_output_tx),
        })
        .invoke_handler(tauri::generate_handler![js2rs, get_containers, get_logs])
        .setup(|app| {
            let handle = app.handle();
            tauri::async_runtime::spawn(async move {
                loop {
                    if let Some(output) = async_proc_output_rx.recv().await {
                        rs2js(output, &handle);
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("failed to run the app");
}
