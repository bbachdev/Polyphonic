use std::collections::HashMap;
use std::fs;
use std::time::{SystemTime, UNIX_EPOCH};

use tauri::{AppHandle, Manager};

use crate::db::db_connect;
use crate::formatter::{generate_md5, generate_salt, get_library_hash, save_library_hash};
use crate::models::{Library, LibraryConfig};
use crate::music::sync_library;
use crate::subsonic::{get_album_list, get_playlist_songs, ping_server, stream};

#[tauri::command]
pub async fn add_server(library: LibraryConfig) -> Result<Library, String> {
    //Create salt and hashed password
    let salt = generate_salt();
    let hashed_password = generate_md5(&library.password, &salt);

    //Get current time in milliseconds (for last_scanned)
    //Note: Could potentially move this slightly later (but would need to modify structs)
    let start = SystemTime::now();
    let since_the_epoch = start.duration_since(UNIX_EPOCH);

    //Create regular library struct
    let mut library = Library {
        id: library.id,
        name: library.name,
        host: library.host,
        port: library.port,
        username: library.username,
        hashed_password,
        salt,
        last_scanned: since_the_epoch.unwrap().as_millis().to_string(),
    };

    match ping_server(&library).await {
        Ok(_) => {
            //Save library hash to keyring
            match save_library_hash(&library) {
                Ok(_) => {
                    library.hashed_password = "".to_string();
                    Ok(library)
                }
                Err(_) => Err("=ERROR: Failed to save library hash".to_string()),
            }
        }
        Err(_) => Err("=ERROR: Failed to connect to server".to_string()),
    }
}

#[tauri::command]
pub async fn sync_collection(
    libraries: Vec<Library>,
    app_handle: AppHandle,
) -> Result<String, String> {
    for mut library in libraries {
        //Get hashed password from keyring
        match get_library_hash(&library) {
            Ok(hashed_password) => {
                library.hashed_password = hashed_password;
                //Sync library
                match sync_library(&library, &app_handle).await {
                    Ok(_) => println!("Library synced"),
                    Err(e) => println!("Error: {}", e),
                }
            }
            Err(_) => println!("Error: Failed to get hashed password"),
        }
    }
    Ok("Collection synced".to_string())
}

#[tauri::command]
pub async fn load_songs(
    mut library: Library,
    song_ids: Vec<String>,
) -> Result<Vec<Vec<u8>>, String> {
    //Get library pass
    let hashed_password = get_library_hash(&library).unwrap();
    library.hashed_password = hashed_password;

    let mut song_data: Vec<Vec<u8>> = vec![];
    for song_id in song_ids {
        match stream(&library, &song_id).await {
            Ok(song) => {
                song_data.push(song);
            }
            Err(e) => println!("Error: {}", e),
        }
    }
    Ok(song_data)
}

#[tauri::command]
pub async fn get_libraries(app_handle: AppHandle) -> Result<Vec<Library>, String> {
    let libraries = crate::db::get_libraries(&app_handle).await.unwrap();
    Ok(libraries)
}

#[tauri::command]
pub async fn get_recently_played(library: Library) -> Result<Vec<String>, String> {
    let mut album_ids = vec![];
    match get_album_list(&library, "recent".to_string()).await {
        Ok(album_list_response) => {
            for album in album_list_response.data.album_list_2.album {
                album_ids.push(album.id);
            }
        }
        Err(e) => println!("Error: {}", e),
    }
    Ok(album_ids)
}

#[tauri::command]
pub async fn get_songs_for_playlist(library: Library, playlist_id: String) -> Result<Vec<String>, String> {
    let mut song_ids = vec![];
    match get_playlist_songs(&library, &playlist_id).await {
        Ok(song_list_response) => {
            for song in song_list_response.data.playlist.entry {
                song_ids.push(song.id);
            }
        }
        Err(e) => println!("Error: {}", e),
    }
    Ok(song_ids)
}

#[tauri::command]
pub async fn update_library_modified(app_handle: AppHandle, data: HashMap<String, String>) -> Result<bool, String> {
  let pool = db_connect(&app_handle).await.unwrap();
  for (key, value) in data {
    println!("{}: {}", key, value);
    match sqlx::query(
      "UPDATE libraries SET last_scanned = (?) WHERE id = (?)",
    )
    .bind(value)
    .bind(key)
    .execute(&pool)
    .await {
      Ok(_) => {},
      Err(e) => println!("Error: {}", e),
    }
  }
  Ok(true)
}

#[tauri::command]
pub async fn clear_cover_art_cache(app_handle: AppHandle) -> Result<bool, String> {
  let binding = app_handle.path().app_config_dir().unwrap();
  let app_data_dir = binding.to_str().unwrap();
  let data_dir_string = app_data_dir.to_string();

  let cover_art_path = format!("{}/cover_art", data_dir_string);
  fs::remove_dir_all(cover_art_path).unwrap();
  Ok(true)
}