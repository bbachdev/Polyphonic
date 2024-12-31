use sqlx::{Pool, Sqlite};
use tauri::{AppHandle, Manager};

use crate::models::Library;

pub async fn db_connect(app_handle: &AppHandle) -> Result<Pool<Sqlite>, anyhow::Error> {
    let binding = app_handle.path().app_config_dir().unwrap();
    let app_data_dir = binding.to_str().unwrap();
    let db_path = format!("{}/music.db", app_data_dir);

    let pool = sqlx::sqlite::SqlitePool::connect(&db_path).await?;
    Ok(pool)
}

pub async fn insert_libraries(
    pool: &Pool<Sqlite>,
    libraries: &Vec<Library>,
) -> Result<(), anyhow::Error> {
    //TODO: Check if there's a more efficient way to do this
    for library in libraries {
        let library_id = &library.id;
        let library_name = &library.name;
        let library_host = &library.host;
        let library_port = library.port.unwrap_or(-1);
        let library_username = &library.username;
        let library_salt = &library.salt;

        sqlx::query(
      "INSERT INTO libraries (id, name, host, port, username, salt) VALUES (?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(library_id)
        .bind(library_name)
        .bind(library_host)
        .bind(library_port)
        .bind(library_username)
        .bind(library_salt)
        .execute(pool)
        .await?;
    }
    Ok(())
}
