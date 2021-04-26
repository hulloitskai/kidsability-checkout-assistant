use crate::checkout::CheckoutItem;

use graphql::SimpleObject;

#[derive(Debug, Clone, SimpleObject)]
#[graphql(name = "CheckoutItem")]
pub struct CheckoutItemObject {
    accession_code: String,
}

impl CheckoutItemObject {
    pub fn new(item: CheckoutItem) -> Self {
        let CheckoutItem { accession_code } = item;
        Self { accession_code }
    }
}
