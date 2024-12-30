mod commands;
mod formatter;
mod models;
mod responses;
mod subsonic;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![commands::add_server])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
