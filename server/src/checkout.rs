use anyhow::bail;
use anyhow::Context as AnyhowContext;
use anyhow::Result;

use std::collections::HashMap as Map;
use std::sync::Mutex;

use tokio::sync::mpsc::channel;
use tokio::sync::mpsc::{Receiver, Sender};

#[derive(Debug, Clone)]
pub struct CheckoutItem {
    pub accession_code: String,
}

#[derive(Default, Debug)]
pub struct CheckoutNotifier {
    senders: Mutex<Map<String, Sender<CheckoutItem>>>,
}

impl CheckoutNotifier {
    pub fn new() -> Self {
        Self::default()
    }

    pub async fn notify(
        &self,
        session_id: &str,
        item: CheckoutItem,
    ) -> Result<()> {
        let sender = {
            let senders = self.senders.lock().unwrap();
            let sender =
                senders.get(session_id).context("invalid session ID")?;
            sender.clone()
        };
        sender.send(item).await?;
        Ok(())
    }

    pub fn subscribe(
        &self,
        session_id: &str,
    ) -> Result<Receiver<CheckoutItem>> {
        let mut senders = self.senders.lock().unwrap();
        if senders.contains_key(session_id) {
            bail!("invalid session ID")
        }
        let (sender, receiver) = channel(1);
        senders.insert(session_id.to_owned(), sender);
        Ok(receiver)
    }
}
