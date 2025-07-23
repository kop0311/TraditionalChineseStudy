use redis::{Client, Connection, RedisResult};
use std::env;

pub type RedisClient = Client;

pub async fn create_redis_client() -> Result<RedisClient, Box<dyn std::error::Error>> {
    let redis_url = env::var("REDIS_URL")
        .unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string());

    let client = Client::open(redis_url)?;
    
    // Test connection
    let mut conn = client.get_connection()?;
    let _: String = redis::cmd("PING").query(&mut conn)?;
    
    println!("✅ Redis connection established");
    Ok(client)
}
