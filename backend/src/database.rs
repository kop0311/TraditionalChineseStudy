use diesel::prelude::*;
use diesel::r2d2::{self, ConnectionManager, Pool};
use std::env;

pub type DbPool = Pool<ConnectionManager<PgConnection>>;

pub async fn establish_connection() -> Result<DbPool, Box<dyn std::error::Error>> {
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");

    let manager = ConnectionManager::<PgConnection>::new(database_url);
    let pool = r2d2::Pool::builder()
        .max_size(10)
        .build(manager)?;

    println!("✅ Database connection pool established");
    Ok(pool)
}
