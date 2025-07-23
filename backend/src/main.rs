use std::env;
use warp::Filter;
use tracing_subscriber;

mod auth;
mod characters;
mod database;
mod errors;
mod models;
mod redis_client;
mod schema;
mod validation;

use auth::auth_routes;
use characters::character_routes;
use database::establish_connection;
use redis_client::create_redis_client;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing
    tracing_subscriber::init();

    // Load environment variables
    dotenv::dotenv().ok();

    // Initialize database connection
    let db_pool = establish_connection().await?;
    
    // Initialize Redis client
    let redis_client = create_redis_client().await?;

    // CORS configuration
    let cors = warp::cors()
        .allow_any_origin()
        .allow_headers(vec!["content-type", "authorization"])
        .allow_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"]);

    // API routes
    let api_routes = warp::path("api")
        .and(
            auth_routes(db_pool.clone())
                .or(character_routes(db_pool.clone(), redis_client.clone()))
        )
        .with(cors)
        .with(warp::trace::request());

    // Health check endpoint
    let health = warp::path("health")
        .and(warp::get())
        .map(|| warp::reply::json(&serde_json::json!({"status": "ok"})));

    let routes = health.or(api_routes);

    let port = env::var("PORT")
        .unwrap_or_else(|_| "9005".to_string())
        .parse::<u16>()
        .expect("PORT must be a valid number");

    println!("🚀 Traditional Chinese API Server starting on port {}", port);

    warp::serve(routes)
        .run(([0, 0, 0, 0], port))
        .await;

    Ok(())
}
