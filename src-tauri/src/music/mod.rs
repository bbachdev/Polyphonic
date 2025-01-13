use std::{fs, path::Path};

use crate::{
    db::{db_connect, insert_albums, insert_artists, insert_library, insert_playlists, insert_songs},
    formatter::create_connection_string,
    models::{Album, Artist, Library, Playlist, Song},
    responses::{SubsonicAlbumID3, SubsonicChild, SubsonicGetArtistsResponse, SubsonicPlaylist, SubsonicResponse},
    subsonic::{get_album_art, get_albums_for_artist, get_artists, get_playlists, get_songs_for_album},
};
use futures::future::join_all;
use tauri::{AppHandle, Manager};

pub async fn sync_library(library: &Library, app_handle: &AppHandle) -> Result<(), anyhow::Error> {
    println!("Get Artists");
    let artists: SubsonicResponse<SubsonicGetArtistsResponse> = get_artists(library).await?;
    println!("Get Albums");
    let albums: Vec<SubsonicAlbumID3> = get_albums(&artists, library).await?;
    println!("Get Songs");
    let songs: Vec<SubsonicChild> = get_songs(&albums, library).await?;
    println!("Get Cover Art");
    get_cover_art(&albums, library, app_handle).await?;
    println!("Get Playlists");
    let playlists: Vec<SubsonicPlaylist> = get_playlists(library).await?;

    println!("Insert Library");
    let pool = db_connect(app_handle).await?;
    match insert_library(&pool, library).await {
        Ok(_) => println!("Library inserted"),
        Err(e) => println!("Error: {}", e),
    }

    //Transform data (perhaps not necessary for Subsonic-only, but for comaptibility with other future sources)
    let mut transformed_artists: Vec<Artist> = vec![];
    let mut transformed_albums: Vec<Album> = vec![];
    let mut transformed_songs: Vec<Song> = vec![];
    let mut transformed_playlists: Vec<Playlist> = vec![];

    println!("Transform");
    for artist in &artists.data.artists.index {
        for artist_detail in &artist.artist {
            let artist = Artist {
                id: artist_detail.id.clone(),
                name: artist_detail.name.clone(),
                library_id: library.id.clone(),
            };
            transformed_artists.push(artist);
        }
    }

    for album in &albums {
        let album = Album {
            id: album.id.clone(),
            name: album.name.clone(),
            artist_id: album.artist_id.clone().unwrap_or("".to_string()),
            artist_name: album.artist.clone(),
            library_id: library.id.clone(),
            cover_art: album.cover_art.clone(),
            year: album.year,
            duration: album.duration,
        };
        transformed_albums.push(album);
    }

    for song in &songs {
        let song = Song {
            id: song.id.clone(),
            title: song.title.clone(),
            artist_id: song.artist_id.clone().unwrap_or("".to_string()),
            artist_name: song.artist.clone(),
            album_id: song.album_id.clone(),
            album_name: song.album.clone(),
            library_id: library.id.clone(),
            track: song.track,
            duration: song.duration,
            disc_number: song.disc_number.unwrap_or(1),
            content_type: song.content_type.clone(),
            cover_art: song.cover_art.clone().unwrap_or("".to_string()),
        };
        transformed_songs.push(song);
    }

    for playlist in &playlists {
        let playlist = Playlist {
            id: playlist.id.clone(),
            library_id: library.id.clone(),
            name: playlist.name.clone(),
            owner: playlist.owner.clone(),
            created: playlist.created.clone(),
            modified: playlist.changed.clone(),
            song_count: playlist.song_count.unwrap_or(0),
            duration: playlist.duration.unwrap_or(0),
        };
        transformed_playlists.push(playlist);
    }

    //Write to DB
    println!("Insert Artists");
    match insert_artists(&pool, &transformed_artists).await {
        Ok(_) => println!("Artists inserted"),
        Err(e) => println!("Error: {}", e),
    }
    println!("Insert Albums");
    match insert_albums(&pool, &transformed_albums).await {
        Ok(_) => println!("Albums inserted"),
        Err(e) => println!("Error: {}", e),
    }
    println!("Insert Songs");
    match insert_songs(&pool, &transformed_songs).await {
        Ok(_) => println!("Songs inserted"),
        Err(e) => println!("Error: {}", e),
    }
    println!("Insert Playlists");
    match insert_playlists(&pool, &transformed_playlists).await {
        Ok(_) => println!("Playlists inserted"),
        Err(e) => println!("Error: {}", e),
    }

    Ok(())
}

/* Retrieve each album per artist */
pub async fn get_albums(
    artists: &SubsonicResponse<SubsonicGetArtistsResponse>,
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
                let cover_art_clone = album_response.data.album.cover_art.clone();
                for song in &album_response.data.album.song {
                    let mut song_clone = song.clone();
                    song_clone.cover_art = Some(cover_art_clone.clone());
                    songs.push(song_clone);
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
    albums: &Vec<SubsonicAlbumID3>,
    library: &Library,
    app_handle: &AppHandle,
) -> Result<(), anyhow::Error> {
    let binding = app_handle.path().app_config_dir().unwrap();
    let app_data_dir = binding.to_str().unwrap();

    //Create cover_art folder if it doesn't exist
    let cover_art_dir = format!("{}/cover_art", app_data_dir);
    if !Path::new(&cover_art_dir).exists() {
        fs::create_dir(&cover_art_dir).unwrap();
    }

    let data_dir_string = app_data_dir.to_string();
    let base_url = create_connection_string(library, "getCoverArt");
    let client = reqwest::Client::new();
    let mut futures = vec![];
    for album in albums {
        let url = format!("{}&id={}", base_url, &album.cover_art);
        futures.push(get_album_art(
            url,
            album.cover_art.clone(),
            client.clone(),
            &data_dir_string,
        ));
    }
    join_all(futures).await;
    Ok(())
}
