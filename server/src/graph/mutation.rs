use super::CheckoutItemObject;
use crate::checkout::{CheckoutItem, CheckoutNotifier};

use graphql::{Context, FieldResult};
use graphql::{InputObject, Object, SimpleObject};

#[derive(Debug, Clone)]
pub struct Mutation;

#[Object]
impl Mutation {
    async fn checkout_item(
        &self,
        ctx: &Context<'_>,
        input: CheckoutItemInput,
    ) -> FieldResult<CheckoutItemPayload> {
        let CheckoutItemInput {
            session_id,
            accession_code,
        } = input;

        let item = CheckoutItem { accession_code };
        let notifier: &CheckoutNotifier = ctx.data_unchecked();
        notifier.notify(&session_id, item.clone()).await?;

        let payload = CheckoutItemPayload {
            item: CheckoutItemObject::new(item),
        };
        Ok(payload)
    }
}

#[derive(Debug, Clone, InputObject)]
pub struct CheckoutItemInput {
    session_id: String,
    accession_code: String,
}

#[derive(Debug, Clone, SimpleObject)]
pub struct CheckoutItemPayload {
    item: CheckoutItemObject,
}
