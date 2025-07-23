use warp::Filter;
use tracing::info;

pub fn log() -> warp::log::Log<impl Fn(warp::log::Info) + Copy> {
    warp::log::custom(move |info| {
        info!(
            method = %info.method(),
            path = %info.path(),
            status = %info.status(),
            elapsed = ?info.elapsed(),
            remote_addr = ?info.remote_addr(),
            "HTTP request processed"
        );
    })
}