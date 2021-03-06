use std::env::remove_var as remove_env_var;
use std::env::set_var as set_env_var;
use std::env::var as env_var;
use std::env::VarError as EnvVarError;
use std::io::ErrorKind as IoErrorKind;

use anyhow::Context as AnyhowContext;
use anyhow::Result;

use dotenv::dotenv;
use dotenv::Error as DotenvError;

pub const NAMESPACE: &str = "KIDSABILITY_ASSISTANT";

pub fn key(name: &str) -> String {
    format!("{}_{}", NAMESPACE, name.to_uppercase())
}

pub fn var(name: &str) -> Result<String, EnvVarError> {
    let key = key(name);
    env_var(&key)
}

pub fn var_or(
    name: &str,
    default: impl Into<String>,
) -> Result<String, EnvVarError> {
    let key = key(name);
    env_var(&key).or_else(|error| match error {
        EnvVarError::NotPresent => Ok(default.into()),
        error => Err(error),
    })
}

pub fn load() -> Result<()> {
    if let Err(DotenvError::Io(error)) = dotenv() {
        if error.kind() != IoErrorKind::NotFound {
            return Err(error).context("failed to load .env");
        }
    }

    // Configure logging.
    let log = var_or("LOG", "warn,server=info".to_owned()).unwrap();
    set_env_var("RUST_LOG", log);

    // Configure backtraces.
    remove_env_var("RUST_BACKTRACE");
    if None == var("BACKTRACE").ok() {
        set_env_var("RUST_BACKTRACE", "1")
    }
    Ok(())
}
