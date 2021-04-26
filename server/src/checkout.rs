use anyhow::Result;
use anyhow::{bail, format_err};

use std::collections::HashMap as Map;
use std::{collections::hash_map::Entry as MapEntry, sync::Mutex};

use tokio::sync::mpsc::channel;
use tokio::sync::mpsc::{Receiver, Sender};

#[derive(Debug, Clone)]
pub struct CheckoutItem {
    pub accession_code: String,
}

#[derive(Default, Debug)]
pub struct CheckoutNotifier {
    channels: Mutex<Map<String, CheckoutChannel>>,
}

impl CheckoutNotifier {
    pub fn new() -> Self {
        Self::default()
    }

    pub async fn notify(
        &self,
        subscriber_code: String,
        item: CheckoutItem,
    ) -> Result<()> {
        use MapEntry::*;
        let sender = {
            let mut channels = self.channels.lock().unwrap();
            match channels.entry(subscriber_code.clone()) {
                Occupied(entry) => {
                    let channel = entry.get();
                    if !channel.has_subscriber() {
                        bail!("invalid subscriber code")
                    }
                    channel.sender.clone()
                }
                Vacant(entry) => {
                    let channel = CheckoutChannel::new();
                    let channel = entry.insert(channel);
                    channel.sender.clone()
                }
            }
        };
        sender.send(item).await?;
        Ok(())
    }

    pub fn subscribe(
        &self,
        subscriber_code: String,
    ) -> Result<Receiver<CheckoutItem>> {
        use MapEntry::*;
        let mut channels = self.channels.lock().unwrap();
        match channels.entry(subscriber_code.clone()) {
            Occupied(mut entry) => {
                let channel = entry.get_mut();
                let receiver = channel
                    .receiver
                    .take()
                    .ok_or_else(|| format_err!("already subscribed"))?;
                Ok(receiver)
            }
            Vacant(entry) => {
                let channel = CheckoutChannel::new();
                let channel = entry.insert(channel);
                let receiver = channel.receiver.take().unwrap();
                Ok(receiver)
            }
        }
    }
}

#[derive(Debug)]
struct CheckoutChannel {
    sender: Sender<CheckoutItem>,
    receiver: Option<Receiver<CheckoutItem>>,
}

impl CheckoutChannel {
    fn new() -> Self {
        let (sender, receiver) = channel(1);
        Self {
            sender,
            receiver: Some(receiver),
        }
    }

    fn has_subscriber(&self) -> bool {
        self.receiver.is_none()
    }
}
