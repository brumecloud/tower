use serde::Serialize;
use serde_json::json;
use tauri::async_runtime::Receiver;
use tauri::Manager;
use tracing::trace;

#[derive(Serialize)]
pub struct AbstractMessage {
    pub destination: String,
    pub payload: String,
    pub topic: String,
}

// wait for message in the AbtractMessage queue channel
pub async fn message_handler<R: tauri::Runtime>(
    message_channel: &mut Receiver<AbstractMessage>,
    manager: &impl Manager<R>,
) {
    loop {
        if let Some(message) = message_channel.recv().await {
            send_to_front(message, manager);
        }
    }
}

// serialize and send the message to the front
fn send_to_front<R: tauri::Runtime>(message: AbstractMessage, manager: &impl Manager<R>) {
    trace!("emitting message to front end for topic {}", message.topic);

    manager
        .emit_all(message.topic.as_str(), json!(message))
        .unwrap();
}
