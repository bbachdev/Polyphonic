use crate::formatter::{generate_md5, generate_salt, save_library_hash};
use crate::models::{Library, LibraryConfig};
use crate::subsonic::ping_server;

#[tauri::command]
pub fn add_server(library: LibraryConfig) -> Result<String, String> {
    //Create salt and hashed password
    let salt = generate_salt();
    let hashed_password = generate_md5(&library.password, &salt);

    //Create regular library struct
    let library = Library {
        id: library.id,
        name: library.name,
        host: library.host,
        port: library.port,
        username: library.username,
        hashed_password,
        salt,
    };

    match ping_server(&library) {
        Ok(_) => {
            //Save library hash to keyring
            match save_library_hash(&library) {
                Ok(_) => Ok("Success".to_string()),
                Err(_) => Err("Failed to save library hash".to_string()),
            }
        }
        Err(_) => Err("Failed to connect to server".to_string()),
    }
}
