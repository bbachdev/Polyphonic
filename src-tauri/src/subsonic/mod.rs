use std::fs::File;
use std::io::{Cursor, Write};
use glob::glob;

use image::{ImageFormat, ImageReader};
use reqwest::Client;

use crate::formatter::create_connection_string;
use crate::models::Library;
use crate::responses::{
    SubsonicBaseResponse, SubsonicGetAlbumList2Response, SubsonicGetAlbumsResponse,
    SubsonicGetArtistsResponse, SubsonicGetPlaylistResponse, SubsonicGetPlaylistsResponse,
    SubsonicGetSongsResponse, SubsonicPlaylist, SubsonicResponse,
};

/* Ping
* https://opensubsonic.netlify.app/docs/endpoints/ping */
pub async fn ping_server(library: &Library) -> Result<(), anyhow::Error> {
    let url = create_connection_string(library, "ping");
    match reqwest::get(&url).await {
        Ok(res) => match res.json::<SubsonicResponse<SubsonicBaseResponse>>().await {
            Ok(sub_response) => {
                if sub_response.data.status == "ok" {
                    Ok(())
                } else {
                    Err(anyhow::anyhow!(
                        "Failed to ping server: {}",
                        sub_response.data.error.unwrap().message
                    ))
                }
            }
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
            Err(e) => Err(anyhow::anyhow!("Album Error: {}", e)),
        },
        Err(e) => Err(anyhow::anyhow!("Album Error: {}", e)),
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
            Err(e) => Err(anyhow::anyhow!("Song Error: {}", e)),
        },
        Err(e) => Err(anyhow::anyhow!("Song Error: {}", e)),
    }
}

/* getCoverArt
*  https://opensubsonic.netlify.app/docs/endpoints/getcoverart */
pub async fn get_album_art(
    url: String,
    cover_id: String,
    client: Client,
    path: &String,
) -> Result<String, anyhow::Error> {
    for entry in glob(&format!("{}/cover_art/{}*", path, cover_id))? {
        match entry {
            Ok(_) => {
                return Ok("".to_string())
            }
            Err(e) => return Err(anyhow::anyhow!("Art Error: {}", e))
        }
    }

    match client.get(&url).send().await {
        Ok(res) => match res.bytes().await {
            Ok(buf) => {
                let mut file_buffer = buf.clone();
                let mut file_extension = "";
                //Determine file type
                let mut reader = ImageReader::new(Cursor::new(&buf));
                match reader.with_guessed_format().unwrap().format() {
                    Some(format) => {
                        if format == ImageFormat::Jpeg {
                            file_extension = ".jpg";
                        } else if format == ImageFormat::Png {
                            file_extension = ".png";
                        } else if format == ImageFormat::Gif {
                            file_extension = ".gif";
                        } else if format == ImageFormat::WebP {
                            file_extension = ".webp";
                        }
                    }
                    None => {
                        //Retry (TODO: Seems race-condition related. Can we limit futures instead?)
                        match client.get(&url).send().await {
                            Ok(res) => match res.bytes().await {
                                Ok(retry_buf) => {
                                    file_buffer = retry_buf.clone();
                                    reader = ImageReader::new(Cursor::new(&retry_buf));
                                    match reader.with_guessed_format().unwrap().format() {
                                        Some(format) => {
                                            if format == ImageFormat::Jpeg {
                                                file_extension = ".jpg";
                                            } else if format == ImageFormat::Png {
                                                file_extension = ".png";
                                            } else if format == ImageFormat::Gif {
                                                file_extension = ".gif";
                                            } else if format == ImageFormat::WebP {
                                                file_extension = ".webp";
                                            }
                                        }
                                        None => {
                                            //Default to png
                                            file_extension = ".png"
                                        }
                                    }
                                }
                                Err(e) => return Err(anyhow::anyhow!("Art Error: {}", e)),
                            },
                            Err(e) => return Err(anyhow::anyhow!("Art Error: {}", e)),
                        }
                    }
                }

                //Save file
                let mut file =
                    File::create(format!("{}/cover_art/{}{}", path, cover_id, file_extension))?;
                return match file.write_all(&file_buffer) {
                    Ok(_) => Ok(format!("{}{}", cover_id, file_extension)),
                    Err(e) => Err(anyhow::anyhow!("Art Error: {}", e)),
                }
            },
            Err(e) => return Err(anyhow::anyhow!("Art Error: {}", e)),
        },
        Err(e) => return Err(anyhow::anyhow!("Art Error: {}", e)),
    }
}

/* getPlaylists */
pub async fn get_playlists(library: &Library) -> Result<Vec<SubsonicPlaylist>, anyhow::Error> {
    let url = create_connection_string(library, "getPlaylists");
    match reqwest::get(&url).await {
        Ok(res) => match res
            .json::<SubsonicResponse<SubsonicGetPlaylistsResponse>>()
            .await
        {
            Ok(playlist_response) => Ok(playlist_response.data.playlists.playlist),
            Err(e) => Err(anyhow::anyhow!("Error: {}", e)),
        },
        Err(e) => Err(anyhow::anyhow!("Error: {}", e)),
    }
}

/* stream
* https://opensubsonic.netlify.app/docs/endpoints/stream */
pub async fn stream(library: &Library, song_id: &str) -> Result<Vec<u8>, anyhow::Error> {
    let base_url = create_connection_string(library, "stream");
    let url = format!("{}&id={}", base_url, song_id);

    match reqwest::get(&url).await {
        Ok(res) => match res.bytes().await {
            Ok(buf) => Ok(buf.to_vec()),
            Err(e) => Err(anyhow::anyhow!("Stream Error: {}", e)),
        },
        Err(e) => Err(anyhow::anyhow!("Stream Error: {}", e)),
    }
}

/* getAlbumList2
*/
pub async fn get_album_list(
    library: &Library,
    list_type: String,
) -> Result<SubsonicResponse<SubsonicGetAlbumList2Response>, anyhow::Error> {
    let mut url = create_connection_string(library, "getAlbumList2");
    url.push_str(&format!("&type={}&size=42", list_type));
    match reqwest::get(&url).await {
        Ok(res) => match res
            .json::<SubsonicResponse<SubsonicGetAlbumList2Response>>()
            .await
        {
            Ok(album_list_response) => Ok(album_list_response),
            Err(e) => Err(anyhow::anyhow!("Album Error: {}", e)),
        },
        Err(e) => Err(anyhow::anyhow!("Album Error: {}", e)),
    }
}

/* getPlaylist */
pub async fn get_playlist_songs(
    library: &Library,
    playlist_id: &str,
) -> Result<SubsonicResponse<SubsonicGetPlaylistResponse>, anyhow::Error> {
    let mut url = create_connection_string(library, "getPlaylist");
    url.push_str(&format!("&id={}", playlist_id));
    match reqwest::get(&url).await {
        Ok(res) => match res
            .json::<SubsonicResponse<SubsonicGetPlaylistResponse>>()
            .await
        {
            Ok(playlist_response) => Ok(playlist_response),
            Err(e) => Err(anyhow::anyhow!("Song Error: {}", e)),
        },
        Err(e) => Err(anyhow::anyhow!("Song Error: {}", e)),
    }
}
