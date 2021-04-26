use chrono::{DateTime, Utc};

#[derive(Debug, Clone, Hash)]
pub struct BuildInfo {
    pub timestamp: DateTime<Utc>,
    pub version: Option<String>,
}
