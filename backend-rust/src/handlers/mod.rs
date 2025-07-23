use std::sync::Arc;
use tokio::sync::Mutex;
use redis::aio::Connection;

use crate::{database::Database, config::Config};

pub mod health;
pub mod classics;
pub mod chapters;
pub mod sentences;
pub mod characters;
pub mod auth;

#[derive(Clone)]
pub struct AppState {
    pub db_pool: sqlx::PgPool,
    pub redis: Arc<Mutex<Connection>>,
    pub config: Config,
}

impl AppState {
    pub fn new(db: Database, redis: Connection, config: Config) -> Self {
        Self {
            db_pool: db.pool,
            redis: Arc::new(Mutex::new(redis)),
            config,
        }
    }
}