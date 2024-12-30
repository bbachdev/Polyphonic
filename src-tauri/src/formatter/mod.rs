use crate::models::Library;
use keyring::Entry;

/* String + Library Formatting */
pub fn create_connection_string(library: &Library, endpoint: &str) -> String {
    let host = match library.port {
        Some(port) => format!("{}:{}", library.host, port),
        None => library.host.clone(),
    };
    let conn_string = format!(
        "{}/rest/{}.view?u={}&t={}&s={}&v=1.16.1&c=Polyphonic&f=json",
        host, endpoint, library.username, library.hashed_password, library.salt
    );
    conn_string
}

/* Security-related functions */
pub fn generate_md5(password: &str, salt: &str) -> String {
    use md5::{Digest, Md5};
    let mut hasher = Md5::new();
    hasher.update(format!("{}{}", password, salt));
    hex::encode(hasher.finalize())
}

pub fn generate_salt() -> String {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    let salt = rng.gen::<[u8; 32]>();
    hex::encode(salt)
}

pub fn get_library_hash(library: &Library) -> Result<String, anyhow::Error> {
    //If not found in keyring, return error
    let entry = Entry::new("Polyphonic", &library.id);
    match entry.get_password() {
        Ok(password) => Ok(password),
        Err(e) => Err(anyhow::anyhow!("Failed to get password: {}", e)),
    }
}

pub fn save_library_hash(library: &Library) -> Result<(), anyhow::Error> {
    let entry = Entry::new("Polyphonic", &library.id);
    match entry.set_password(&library.hashed_password) {
        Ok(_) => Ok(()),
        Err(e) => Err(anyhow::anyhow!("Failed to set password: {}", e)),
    }
}
