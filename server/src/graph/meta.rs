use crate::meta::BuildInfo;

use chrono::{DateTime, Utc};
use graphql::SimpleObject;

#[derive(Debug, Clone, SimpleObject)]
#[graphql(name = "BuildInfo")]
pub struct BuildInfoObject {
    timestamp: DateTime<Utc>,
    version: Option<String>,
}

impl BuildInfoObject {
    pub fn new(info: BuildInfo) -> Self {
        let BuildInfo { timestamp, version } = info;
        BuildInfoObject { timestamp, version }
    }
}
