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
    let migrations = vec![Migration {
      version: 1,
      description: "Create initial tables",
      sql: "CREATE TABLE IF NOT EXISTS libraries (id TEXT PRIMARY KEY, name TEXT, host TEXT, port INTEGER, username TEXT, salt TEXT);
      CREATE TABLE IF NOT EXISTS artists (id TEXT PRIMARY KEY, library_id TEXT REFERENCES libraries(id), name TEXT);
      CREATE TABLE IF NOT EXISTS albums (id TEXT PRIMARY KEY, library_id TEXT REFERENCES libraries(id), name TEXT, artist_id TEXT REFERENCES artists(id), artist_name TEXT, cover_art TEXT, year INTEGER, duration INTEGER);
      CREATE TABLE IF NOT EXISTS songs (id TEXT PRIMARY KEY, library_id TEXT REFERENCES libraries(id), title TEXT, artist_id TEXT, artist_name TEXT, album_id TEXT, album_name TEXT, track INTEGER, disc_number INTEGER, year INTEGER, duration INTEGER, content_type TEXT, cover_art TEXT);",
      kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
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
            commands::get_recently_played
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
