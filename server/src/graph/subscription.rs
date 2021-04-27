use super::CheckoutItemObject;
use crate::checkout::CheckoutNotifier;

use futures::Stream;

use tokio_stream::wrappers::ReceiverStream;
use tokio_stream::StreamExt;

use graphql::Subscription;
use graphql::{Context, FieldResult};

#[derive(Debug, Clone)]
pub struct Subscription;

#[Subscription]
impl Subscription {
    async fn item(
        &self,
        ctx: &Context<'_>,
        subscriber_code: String,
    ) -> FieldResult<impl Stream<Item = CheckoutItemObject>> {
        let notifier: &CheckoutNotifier = ctx.data_unchecked();
        let receiver = notifier.subscribe(&subscriber_code)?;
        let stream = ReceiverStream::new(receiver);
        Ok(stream.map(|item| CheckoutItemObject::new(item)))
    }
}
