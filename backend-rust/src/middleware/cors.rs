use warp::Filter;

pub fn cors() -> warp::cors::Builder {
    warp::cors()
        .allow_any_origin()
        .allow_headers(vec![
            "content-type",
            "authorization",
            "accept",
            "origin",
            "user-agent",
            "x-requested-with",
        ])
        .allow_methods(vec!["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
        .max_age(3600)
}