use crate::models::LibraryConfig;

#[tauri::command]
pub fn add_server(library: LibraryConfig) -> String {
    format!("Hello! You've been greeted from Rust!")
}
