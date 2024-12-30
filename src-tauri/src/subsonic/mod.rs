use crate::formatter::create_connection_string;
use crate::models::Library;
use crate::responses::{SubsonicBaseResponse, SubsonicResponse};

/* Ping
* https://opensubsonic.netlify.app/docs/endpoints/ping */
pub async fn ping_server(library: &Library) -> Result<(), anyhow::Error> {
    let url = create_connection_string(library, "ping");
    match reqwest::get(&url).await {
        Ok(res) => match res.json::<SubsonicResponse<SubsonicBaseResponse>>().await {
            Ok(_) => Ok(()),
            Err(e) => Err(anyhow::anyhow!("Failed to parse response: {}", e)),
        },
        Err(e) => Err(anyhow::anyhow!("Failed to ping server: {}", e)),
    }
}
