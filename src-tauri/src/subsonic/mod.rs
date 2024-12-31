use std::fs::File;
use std::io::Write;

use reqwest::Client;

use crate::formatter::create_connection_string;
use crate::models::Library;
use crate::responses::{
    SubsonicBaseResponse, SubsonicGetAlbumsResponse, SubsonicGetArtistsResponse,
    SubsonicGetSongsResponse, SubsonicResponse,
};

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

/* getArtists
*  https://opensubsonic.netlify.app/docs/endpoints/getartists */

pub async fn get_artists(
    library: &Library,
) -> Result<SubsonicResponse<SubsonicGetArtistsResponse>, anyhow::Error> {
    let url = create_connection_string(library, "getArtists");
    println!("{}", url);
    match reqwest::get(&url).await {
        Ok(res) => match res
            .json::<SubsonicResponse<SubsonicGetArtistsResponse>>()
            .await
        {
            Ok(artist_response) => Ok(artist_response),
            Err(e) => Err(anyhow::anyhow!("Error: {}", e)),
        },
        Err(e) => Err(anyhow::anyhow!("Error: {}", e)),
    }
}

/* getArtist
*  https://opensubsonic.netlify.app/docs/endpoints/getartist */
pub async fn get_albums_for_artist(
    url: String,
    client: Client,
) -> Result<SubsonicResponse<SubsonicGetAlbumsResponse>, anyhow::Error> {
    match client.get(&url).send().await {
        Ok(res) => match res
            .json::<SubsonicResponse<SubsonicGetAlbumsResponse>>()
            .await
        {
            Ok(album_response) => Ok(album_response),
            Err(e) => Err(anyhow::anyhow!("Error: {}", e)),
        },
        Err(e) => Err(anyhow::anyhow!("Error: {}", e)),
    }
}

/* getAlbum
*  https://opensubsonic.netlify.app/docs/endpoints/getalbum */
pub async fn get_songs_for_album(
    url: String,
    client: Client,
) -> Result<SubsonicResponse<SubsonicGetSongsResponse>, anyhow::Error> {
    match client.get(&url).send().await {
        Ok(res) => match res
            .json::<SubsonicResponse<SubsonicGetSongsResponse>>()
            .await
        {
            Ok(album_response) => Ok(album_response),
            Err(e) => Err(anyhow::anyhow!("Error: {}", e)),
        },
        Err(e) => Err(anyhow::anyhow!("Error: {}", e)),
    }
}

/* getCoverArt
*  https://opensubsonic.netlify.app/docs/endpoints/getcoverart */
pub async fn get_album_art(
    url: String,
    cover_id: String,
    client: Client,
    path: &String,
) -> Result<(), anyhow::Error> {
    match client.get(&url).send().await {
        Ok(res) => match res.bytes().await {
            Ok(buf) => {
                //Save file
                let mut file = File::create(format!("{}{}.png", path, cover_id))?;
                match file.write_all(&buf) {
                    Ok(_) => Ok(()),
                    Err(e) => Err(anyhow::anyhow!("Error: {}", e)),
                }
            }
            Err(e) => Err(anyhow::anyhow!("Error: {}", e)),
        },
        Err(e) => Err(anyhow::anyhow!("Error: {}", e)),
    }
}
