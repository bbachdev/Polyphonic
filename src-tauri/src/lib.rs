use tauri_plugin_sql::{Migration, MigrationKind};

mod commands;
mod db;
mod formatter;
mod models;
mod music;
mod responses;
mod subsonic;

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
    unsafe { // Not unsafe if you don't use edition 2024
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:music.db", migrations)
                .build(),
        )
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
