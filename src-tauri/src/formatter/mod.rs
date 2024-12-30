use crate::models::Library;

/* String + Library Formatting */
pub fn create_connection_string(library: Library, endpoint: &str) -> String {
    let mut host = library.host;
    if let Some(port) = library.port {
        host = format!("{}:{}", host, port)
    }
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
