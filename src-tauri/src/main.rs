// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod services;
mod tower;

use std::collections::HashMap;

use log::{info, trace};
use services::containers;
use std::sync::Arc;
use tokio::sync::{mpsc, Mutex};
use tower::manager::TowerManager;
use tower::message::{message_handler, AbstractMessage};

fn main() {
    env_logger::init();
    info!("Launching Tower backend v0.1");
    let (abstract_message_sender, mut abstract_message_receiver) =
        mpsc::channel::<AbstractMessage>(1);

    tauri::Builder::default()
        .manage(TowerManager {
            message_queue: Arc::new(Mutex::new(abstract_message_sender)),
            thread_handles: Arc::new(Mutex::new(HashMap::new())),
        })
        .invoke_handler(tauri::generate_handler![
            containers::get_containers,
            containers::get_logs,
            containers::stop_get_logs
        ])
        .setup(|app| {
            let handle = app.handle();

            // front message sending
            tauri::async_runtime::spawn(async move {
                trace!("launching the message handler thread");
                message_handler(&mut abstract_message_receiver, &handle).await;
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Failed to run Tower app");
}
