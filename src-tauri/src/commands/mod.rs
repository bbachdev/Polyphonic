use tauri::AppHandle;

use crate::formatter::{generate_md5, generate_salt, get_library_hash, save_library_hash};
use crate::models::{Library, LibraryConfig};
use crate::music::sync_library;
use crate::subsonic::ping_server;

#[tauri::command]
pub async fn add_server(library: LibraryConfig) -> Result<Library, String> {
    //Create salt and hashed password
    let salt = generate_salt();
    let hashed_password = generate_md5(&library.password, &salt);

    //Create regular library struct
    let mut library = Library {
        id: library.id,
        name: library.name,
        host: library.host,
        port: library.port,
        username: library.username,
        hashed_password,
        salt,
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
