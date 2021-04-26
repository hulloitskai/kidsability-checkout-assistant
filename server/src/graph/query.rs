use super::BuildInfoObject;
use crate::meta::BuildInfo;

use graphql::Object;
use graphql::{Context, FieldResult};

#[derive(Debug, Clone)]
pub struct Query;

#[Object]
impl Query {
    async fn build_info(
        &self,
        ctx: &Context<'_>,
    ) -> FieldResult<BuildInfoObject> {
        let info = ctx.data::<BuildInfo>()?;
        let info = BuildInfoObject::new(info.to_owned());
        Ok(info)
    }
}
