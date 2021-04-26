use super::CheckoutItemObject;
use crate::checkout::{CheckoutItem, CheckoutNotifier};

use graphql::Object;
use graphql::{Context, FieldResult};

#[derive(Debug, Clone)]
pub struct Mutation;

#[Object]
impl Mutation {
    async fn checkout_item(
        &self,
        ctx: &Context<'_>,
        subscriber_code: String,
        accession_code: String,
    ) -> FieldResult<CheckoutItemObject> {
        let notifier: &CheckoutNotifier = ctx.data_unchecked();
        let item = CheckoutItem { accession_code };
        notifier.notify(subscriber_code, item.clone()).await?;
        Ok(CheckoutItemObject::new(item))
    }
}
