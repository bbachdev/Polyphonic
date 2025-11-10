use tauri_plugin_sql::{Migration, MigrationKind};
use tauri::Manager;

mod commands;
mod db;
mod formatter;
mod models;
mod music;
mod responses;
mod subsonic;

// HTTP server for serving audio files on Linux
#[cfg(target_os = "linux")]
mod audio_server {
    use std::sync::{Arc, Mutex};
    use std::path::PathBuf;
    use std::fs::File;
    use std::io::{Read, Seek, SeekFrom};
    use tiny_http::{Server, Response, Header};

    lazy_static::lazy_static! {
        static ref AUDIO_DIR: Arc<Mutex<Option<PathBuf>>> = Arc::new(Mutex::new(None));
    }

    pub fn set_audio_dir(path: PathBuf) {
        let mut dir = AUDIO_DIR.lock().unwrap();
        *dir = Some(path);
    }

    pub fn start_server() {
        std::thread::spawn(|| {
            let server = Server::http("127.0.0.1:38291").expect("Failed to start audio server");

            for request in server.incoming_requests() {
                let path = request.url().trim_start_matches('/');

                let audio_dir = AUDIO_DIR.lock().unwrap();
                if let Some(ref dir) = *audio_dir {
                    let file_path = dir.join(path);

                    match File::open(&file_path) {
                        Ok(mut file) => {
                            let file_size = file.metadata().map(|m| m.len()).unwrap_or(0);

                            // Check for Range header
                            let range_header = request.headers().iter()
                                .find(|h| h.field.equiv("Range"))
                                .map(|h| h.value.as_str());

                            if let Some(range_str) = range_header {
                                // Parse range (format: "bytes=start-end")
                                let range_str = range_str.trim_start_matches("bytes=");
                                let parts: Vec<&str> = range_str.split('-').collect();

                                let start = parts[0].parse::<u64>().unwrap_or(0);
                                let end = if parts.len() > 1 && !parts[1].is_empty() {
                                    parts[1].parse::<u64>().unwrap_or(file_size - 1)
                                } else {
                                    file_size - 1
                                };

                                // Read range
                                let mut buffer = vec![0; (end - start + 1) as usize];
                                file.seek(SeekFrom::Start(start)).ok();
                                file.read_exact(&mut buffer).ok();

                                // Determine content type
                                let content_type = if path.ends_with(".mp3") {
                                    "audio/mpeg"
                                } else if path.ends_with(".flac") {
                                    "audio/flac"
                                } else if path.ends_with(".ogg") {
                                    "audio/ogg"
                                } else if path.ends_with(".m4a") {
                                    "audio/mp4"
                                } else if path.ends_with(".wav") {
                                    "audio/wav"
                                } else {
                                    "audio/mpeg"
                                };

                                let response = Response::from_data(buffer)
                                    .with_status_code(206)
                                    .with_header(Header::from_bytes(&b"Content-Type"[..], content_type.as_bytes()).unwrap())
                                    .with_header(Header::from_bytes(&b"Accept-Ranges"[..], &b"bytes"[..]).unwrap())
                                    .with_header(Header::from_bytes(&b"Content-Range"[..], format!("bytes {}-{}/{}", start, end, file_size).as_bytes()).unwrap())
                                    .with_header(Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..]).unwrap());

                                request.respond(response).ok();
                            } else {
                                // Send entire file
                                let mut buffer = Vec::new();
                                file.read_to_end(&mut buffer).ok();

                                let content_type = if path.ends_with(".mp3") {
                                    "audio/mpeg"
                                } else if path.ends_with(".flac") {
                                    "audio/flac"
                                } else if path.ends_with(".ogg") {
                                    "audio/ogg"
                                } else if path.ends_with(".m4a") {
                                    "audio/mp4"
                                } else if path.ends_with(".wav") {
                                    "audio/wav"
                                } else {
                                    "audio/mpeg"
                                };

                                let response = Response::from_data(buffer)
                                    .with_header(Header::from_bytes(&b"Content-Type"[..], content_type.as_bytes()).unwrap())
                                    .with_header(Header::from_bytes(&b"Accept-Ranges"[..], &b"bytes"[..]).unwrap())
                                    .with_header(Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..]).unwrap());

                                request.respond(response).ok();
                            }
                        }
                        Err(_) => {
                            request.respond(Response::from_string("Not Found").with_status_code(404)).ok();
                        }
                    }
                } else {
                    request.respond(Response::from_string("Server not initialized").with_status_code(500)).ok();
                }
            }
        });
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
        version: 1,
        description: "Create initial tables",
        sql: "CREATE TABLE IF NOT EXISTS libraries (id TEXT PRIMARY KEY, name TEXT, host TEXT, port INTEGER, username TEXT, salt TEXT);
        CREATE TABLE IF NOT EXISTS artists (id TEXT PRIMARY KEY, library_id TEXT REFERENCES libraries(id), name TEXT);
        CREATE TABLE IF NOT EXISTS albums (id TEXT PRIMARY KEY, library_id TEXT REFERENCES libraries(id), name TEXT, artist_id TEXT REFERENCES artists(id), artist_name TEXT, cover_art TEXT, year INTEGER, duration INTEGER);
        CREATE TABLE IF NOT EXISTS songs (id TEXT PRIMARY KEY, library_id TEXT REFERENCES libraries(id), title TEXT, artist_id TEXT, artist_name TEXT, album_id TEXT, album_name TEXT, track INTEGER, disc_number INTEGER, year INTEGER, duration INTEGER, content_type TEXT, cover_art TEXT);",
        kind: MigrationKind::Up,
      },
      Migration {
        version: 2,
        description: "Create playlists table",
        sql: "CREATE TABLE IF NOT EXISTS playlists (id TEXT PRIMARY KEY, library_id TEXT REFERENCES libraries(id), name TEXT, owner TEXT, created TEXT, modified TEXT, song_count INTEGER, duration INTEGER);",
        kind: MigrationKind::Up,
      },
      Migration {
        version: 3,
        description: "Add last_scanned column to libraries",
        sql: "ALTER TABLE libraries ADD COLUMN last_scanned TEXT;",
        kind: MigrationKind::Up,
      },
      Migration {
        version: 4,
        description: "Add tags table and album_tags table",
        sql: "CREATE TABLE IF NOT EXISTS tags (id TEXT PRIMARY KEY, name TEXT, description TEXT);
        CREATE TABLE IF NOT EXISTS album_tags (id TEXT PRIMARY KEY, tag_id TEXT REFERENCES tags(id), album_id TEXT REFERENCES albums(id));",
        kind: MigrationKind::Up,
      },
      Migration {
        version: 5,
        description: "Add unique constraint to album_tags table",
        sql: "CREATE UNIQUE INDEX IF NOT EXISTS album_tag_idx ON album_tags (album_id, tag_id);",
        kind: MigrationKind::Up,
      },
    ];

    #[cfg(target_os = "linux")]
    unsafe {
        // Not unsafe if you don't use edition 2024
        std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
        std::env::set_var("__NV_DISABLE_EXPLICIT_SYNC", "1");
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:music.db", migrations)
                .build(),
        )
        .setup(|app| {
            #[cfg(target_os = "linux")]
            {
                // Get the app config directory and start audio server
                let app_config_dir = app.path().app_config_dir()?;
                audio_server::set_audio_dir(app_config_dir);
                audio_server::start_server();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::add_server,
            commands::sync_collection,
            commands::load_songs,
            commands::get_libraries,
            commands::get_recently_played,
            commands::get_recently_added,
            commands::get_songs_for_playlist,
            commands::update_library_modified,
            commands::clear_cover_art_cache,
            commands::clear_audio_cache,
            commands::stream_song_to_file,
            commands::get_cover_art_base64,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
