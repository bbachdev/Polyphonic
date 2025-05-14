use std::time::{SystemTime, UNIX_EPOCH};

use sqlx::{Pool, Sqlite};
use tauri::{AppHandle, Manager};

use crate::{
    formatter::get_library_hash,
    models::{Album, Artist, DBLibrary, Library, Playlist, Song},
};

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
    let start = SystemTime::now();
    let since_the_epoch = start.duration_since(UNIX_EPOCH);
    let library_last_scanned = since_the_epoch.unwrap().as_millis().to_string();

    sqlx::query(
        "INSERT OR IGNORE INTO libraries (id, name, host, port, username, salt, last_scanned) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(library_id)
    .bind(library_name)
    .bind(library_host)
    .bind(library_port)
    .bind(library_username)
    .bind(library_salt)
    .bind(library_last_scanned)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn insert_artists(
    pool: &Pool<Sqlite>,
    artists: &Vec<Artist>,
    artist_ids: &Vec<String>,
) -> Result<(), anyhow::Error> {
    //TODO: Check if there's a more efficient way to do this
    for artist in artists {
        let artist_id = &artist.id;
        let artist_name = &artist.name;
        let library_id = &artist.library_id;

        sqlx::query("INSERT OR IGNORE INTO artists (id, name, library_id) VALUES (?, ?, ?)")
            .bind(artist_id)
            .bind(artist_name)
            .bind(library_id)
            .execute(pool)
            .await?;
    }

    let placeholders: String = artist_ids
        .iter()
        .map(|_| "?")
        .collect::<Vec<_>>()
        .join(", ");
    let query = format!("DELETE FROM artists WHERE id NOT IN ({})", placeholders);
    let mut query_object = sqlx::query(&query);
    for id in artist_ids {
        query_object = query_object.bind(id);
    }

    query_object.execute(pool).await?;

    Ok(())
}

pub async fn insert_albums(
    pool: &Pool<Sqlite>,
    albums: &Vec<Album>,
    album_ids: &Vec<String>,
) -> Result<(), anyhow::Error> {
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
            "INSERT OR IGNORE INTO albums (id, name, artist_id, artist_name, library_id, cover_art, year, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
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

    let placeholders: String = album_ids.iter().map(|_| "?").collect::<Vec<_>>().join(", ");
    let query = format!("DELETE FROM albums WHERE id NOT IN ({})", placeholders);
    let mut query_object = sqlx::query(&query);
    for id in album_ids {
        query_object = query_object.bind(id);
    }

    query_object.execute(pool).await?;

    Ok(())
}

pub async fn insert_songs(
    pool: &Pool<Sqlite>,
    songs: &Vec<Song>,
    song_ids: &Vec<String>,
) -> Result<(), anyhow::Error> {
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
        let song_disc_number = song.disc_number;
        let song_duration = song.duration.unwrap_or(0);
        let song_content_type = &song.content_type;
        let song_cover_art = &song.cover_art;

        sqlx::query(
            "INSERT OR IGNORE INTO songs (id, title, artist_id, artist_name, album_id, album_name, library_id, track, disc_number, duration, content_type, cover_art) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(song_id)
        .bind(song_title)
        .bind(song_artist_id)
        .bind(song_artist_name)
        .bind(song_album_id)
        .bind(song_album_name)
        .bind(song_library_id)
        .bind(song_track)
        .bind(song_disc_number)
        .bind(song_duration)
        .bind(song_content_type)
        .bind(song_cover_art)
        .execute(pool)
        .await?;
    }

    let placeholders: String = song_ids.iter().map(|_| "?").collect::<Vec<_>>().join(", ");
    let query = format!("DELETE FROM songs WHERE id NOT IN ({})", placeholders);
    let mut query_object = sqlx::query(&query);
    for id in song_ids {
        query_object = query_object.bind(id);
    }

    query_object.execute(pool).await?;
    Ok(())
}

pub async fn insert_playlists(
    pool: &Pool<Sqlite>,
    playlists: &Vec<Playlist>,
    playlist_ids: &Vec<String>,
) -> Result<(), anyhow::Error> {
    for playlist in playlists {
        sqlx::query(
            "INSERT OR IGNORE INTO playlists (id, library_id, name, owner, created, modified, song_count, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(playlist.id.clone())
        .bind(playlist.library_id.clone())
        .bind(playlist.name.clone())
        .bind(playlist.owner.clone())
        .bind(playlist.created.clone())
        .bind(playlist.modified.clone())
        .bind(playlist.song_count)
        .bind(playlist.duration)
        .execute(pool)
        .await?;
    }

    let placeholders: String = playlist_ids
        .iter()
        .map(|_| "?")
        .collect::<Vec<_>>()
        .join(", ");
    let query = format!("DELETE FROM playlists WHERE id NOT IN ({})", placeholders);
    let mut query_object = sqlx::query(&query);
    for id in playlist_ids {
        query_object = query_object.bind(id);
    }

    query_object.execute(pool).await?;
    Ok(())
}

pub async fn get_libraries(app_handle: &AppHandle) -> Result<Vec<Library>, anyhow::Error> {
    let mut libraries_with_hash: Vec<Library> = Vec::new();
    let db = db_connect(app_handle).await?;
    let libraries = sqlx::query_as::<_, DBLibrary>(
        "SELECT id, name, host, port, username, salt, last_scanned FROM libraries ORDER BY id COLLATE NOCASE ASC",
    )
    .fetch_all(&db)
    .await?;

    for library in libraries {
        let mut real_library = Library {
            id: library.id,
            name: library.name,
            host: library.host,
            port: library.port,
            username: library.username,
            hashed_password: "".to_string(),
            salt: library.salt,
            last_scanned: library.last_scanned,
        };
        match get_library_hash(&real_library) {
            Ok(hashed_password) => {
                real_library.hashed_password = hashed_password;
            }
            Err(_) => println!("Error: Failed to get hashed password"),
        }
        libraries_with_hash.push(real_library);
    }
    Ok(libraries_with_hash)
}

pub async fn update_last_scanned(pool: &Pool<Sqlite>, library_id: &String) -> Result<(), anyhow::Error> {
    let mut query_object = sqlx::query("UPDATE libraries SET last_scanned = (?) WHERE id = (?)");
    let start = SystemTime::now();
    let since_the_epoch = start.duration_since(UNIX_EPOCH);
    let library_last_scanned = since_the_epoch.unwrap().as_millis().to_string();
    query_object = query_object.bind(library_last_scanned).bind(library_id);
    query_object.execute(pool).await?;
    Ok(())
}