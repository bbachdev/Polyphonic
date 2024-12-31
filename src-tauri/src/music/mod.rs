use crate::{
    formatter::create_connection_string,
    models::Library,
    responses::{SubsonicAlbumID3, SubsonicChild, SubsonicGetArtistsResponse, SubsonicResponse},
    subsonic::{get_album_art, get_albums_for_artist, get_artists, get_songs_for_album},
};
use futures::future::join_all;
use tauri::{AppHandle, Manager};

pub async fn sync_library(library: &Library, app_handle: &AppHandle) -> Result<(), anyhow::Error> {
    let artists = get_artists(library).await?;
    let albums = get_albums(artists, library).await?;
    let songs = get_songs(&albums, library).await?;
    get_cover_art(albums, library, app_handle).await?;

    //TODO: Write to DB

    Ok(())
}

/* Retrieve each album per artist */
pub async fn get_albums(
    artists: SubsonicResponse<SubsonicGetArtistsResponse>,
    library: &Library,
) -> Result<Vec<SubsonicAlbumID3>, anyhow::Error> {
    let mut albums: Vec<SubsonicAlbumID3> = vec![];
    let base_url = create_connection_string(library, "getArtist");
    let client = reqwest::Client::new();
    let mut futures = vec![];
    for index in &artists.data.artists.index {
        for artist in &index.artist {
            let url = format!("{}&id={}", base_url, artist.id);
            futures.push(get_albums_for_artist(url, client.clone()));
        }
    }
    let album_calls = join_all(futures).await;
    for album_call in album_calls {
        match album_call {
            Ok(album_response) => {
                for album in &album_response.data.artist.album {
                    albums.push(album.clone());
                }
            }
            Err(e) => {
                println!("Error: {}", e);
            }
        }
    }
    Ok(albums)
}

/* Similarly, get songs for each album */
pub async fn get_songs(
    albums: &Vec<SubsonicAlbumID3>,
    library: &Library,
) -> Result<Vec<SubsonicChild>, anyhow::Error> {
    let mut songs: Vec<SubsonicChild> = vec![];
    let base_url = create_connection_string(library, "getAlbum");
    let client = reqwest::Client::new();
    let mut futures = vec![];
    for album in albums {
        let url = format!("{}&id={}", base_url, album.id);
        futures.push(get_songs_for_album(url, client.clone()));
    }
    let album_calls = join_all(futures).await;
    for album_call in album_calls {
        match album_call {
            Ok(album_response) => {
                for song in &album_response.data.album.song {
                    songs.push(song.clone());
                }
            }
            Err(e) => {
                println!("Error: {}", e);
            }
        }
    }
    Ok(songs)
}

/* Sync album art */
async fn get_cover_art(
    albums: Vec<SubsonicAlbumID3>,
    library: &Library,
    app_handle: &AppHandle,
) -> Result<(), anyhow::Error> {
    let binding = app_handle.path().app_data_dir().unwrap();
    let app_data_dir = binding.to_str().unwrap();

    let data_dir_string = app_data_dir.to_string();
    let base_url = create_connection_string(library, "getCoverArt");
    let client = reqwest::Client::new();
    let mut futures = vec![];
    for album in albums {
        let url = format!("{}&id={}", base_url, &album.cover_art);
        futures.push(get_album_art(
            url,
            album.cover_art,
            client.clone(),
            &data_dir_string,
        ));
    }
    join_all(futures).await;
    Ok(())
}
