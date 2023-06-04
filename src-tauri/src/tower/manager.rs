use std::{collections::HashMap, sync::Arc};

use tokio::sync::{mpsc, Mutex};

use super::message::AbstractMessage;

#[derive(PartialEq, Eq, Hash, Clone)]
pub enum ThreadTopics {
    CONTAINERS = 0,
    PODS = 1,
}

#[derive(Eq, Hash, PartialEq, Clone)]
pub struct ThreadIdentifier {
    pub topic: ThreadTopics,
    pub element: String,
}

pub struct TowerManager {
    // communicate to the front with message Q
    pub message_queue: Arc<Mutex<mpsc::Sender<AbstractMessage>>>,
    pub thread_handles: Arc<Mutex<HashMap<ThreadIdentifier, bool>>>,
}
