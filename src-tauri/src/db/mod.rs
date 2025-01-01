use sqlx::{Pool, Sqlite};
use tauri::{AppHandle, Manager};

use crate::models::{Album, Artist, Library, Song};

pub async fn db_connect(app_handle: &AppHandle) -> Result<Pool<Sqlite>, anyhow::Error> {
    let binding = app_handle.path().app_config_dir().unwrap();
    let app_data_dir = binding.to_str().unwrap();
    let db_path = format!("{}/music.db", app_data_dir);

    let pool = sqlx::sqlite::SqlitePool::connect(&db_path).await?;
    Ok(pool)
}

pub async fn insert_library(pool: &Pool<Sqlite>, library: &Library) -> Result<(), anyhow::Error> {
    //TODO: Check if there's a more efficient way to do this
    let library_id = &library.id;
    let library_name = &library.name;
    let library_host = &library.host;
    let library_port = library.port.unwrap_or(-1);
    let library_username = &library.username;
    let library_salt = &library.salt;

    sqlx::query(
        "INSERT INTO libraries (id, name, host, port, username, salt) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(library_id)
    .bind(library_name)
    .bind(library_host)
    .bind(library_port)
    .bind(library_username)
    .bind(library_salt)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn insert_artists(
    pool: &Pool<Sqlite>,
    artists: &Vec<Artist>,
) -> Result<(), anyhow::Error> {
    //TODO: Check if there's a more efficient way to do this
    for artist in artists {
        let artist_id = &artist.id;
        let artist_name = &artist.name;
        let library_id = &artist.library_id;

        sqlx::query("INSERT INTO artists (id, name, library_id) VALUES (?, ?, ?)")
            .bind(artist_id)
            .bind(artist_name)
            .bind(library_id)
            .execute(pool)
            .await?;
    }
    Ok(())
}

pub async fn insert_albums(pool: &Pool<Sqlite>, albums: &Vec<Album>) -> Result<(), anyhow::Error> {
    //TODO: Check if there's a more efficient way to do this
    for album in albums {
        let album_id = &album.id;
        let album_name = &album.name;
        let album_artist_id = &album.artist_id;
        let album_artist_name = &album.artist_name;
        let album_library_id = &album.library_id;
        let album_cover_art = &album.cover_art;
        let album_year = album.year.unwrap_or(9999);
        let album_duration = album.duration;

        sqlx::query(
            "INSERT INTO albums (id, name, artist_id, artist_name, library_id, cover_art, year, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(album_id)
        .bind(album_name)
        .bind(album_artist_id)
        .bind(album_artist_name)
        .bind(album_library_id)
        .bind(album_cover_art)
        .bind(album_year)
        .bind(album_duration)
        .execute(pool)
        .await?;
    }
    Ok(())
}

pub async fn insert_songs(pool: &Pool<Sqlite>, songs: &Vec<Song>) -> Result<(), anyhow::Error> {
    //TODO: Check if there's a more efficient way to do this
    for song in songs {
        let song_id = &song.id;
        let song_title = &song.title;
        let song_artist_id = &song.artist_id;
        let song_artist_name = &song.artist_name;
        let song_album_id = &song.album_id;
        let song_album_name = &song.album_name;
        let song_library_id = &song.library_id;
        let song_track = song.track.unwrap_or(0);
        let song_duration = song.duration.unwrap_or(0);

        sqlx::query(
            "INSERT INTO songs (id, title, artist_id, artist_name, album_id, album_name, library_id, track, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(song_id)
        .bind(song_title)
        .bind(song_artist_id)
        .bind(song_artist_name)
        .bind(song_album_id)
        .bind(song_album_name)
        .bind(song_library_id)
        .bind(song_track)
        .bind(song_duration)
        .execute(pool)
        .await?;
    }
    Ok(())
}
