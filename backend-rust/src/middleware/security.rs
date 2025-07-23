use warp::{Filter, reply::Reply, http::HeaderMap};

pub fn security_headers() -> impl Filter<Extract = impl Reply, Error = std::convert::Infallible> + Clone {
    warp::any()
        .map(|| {
            let mut headers = HeaderMap::new();
            
            // Security headers
            headers.insert("X-Content-Type-Options", "nosniff".parse().unwrap());
            headers.insert("X-Frame-Options", "DENY".parse().unwrap());
            headers.insert("X-XSS-Protection", "1; mode=block".parse().unwrap());
            headers.insert("Referrer-Policy", "strict-origin-when-cross-origin".parse().unwrap());
            headers.insert("Permissions-Policy", "geolocation=(), microphone=(), camera=()".parse().unwrap());
            
            // Content Security Policy
            headers.insert(
                "Content-Security-Policy",
                "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:"
                    .parse()
                    .unwrap(),
            );
            
            // HSTS (HTTP Strict Transport Security) - only in production
            if std::env::var("NODE_ENV").unwrap_or_default() == "production" {
                headers.insert(
                    "Strict-Transport-Security",
                    "max-age=31536000; includeSubDomains; preload".parse().unwrap(),
                );
            }
            
            warp::reply::with_headers(warp::reply(), headers)
        })
}