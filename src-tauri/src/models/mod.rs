use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct LibraryConfig {
    pub id: String,
    pub name: String,
    pub host: String,
    pub port: Option<u16>,
    pub username: String,
    pub password: String,
}

pub struct Library {
    pub id: String,
    pub name: String,
    pub host: String,
    pub port: Option<u16>,
    pub username: String,
    pub hashed_password: String,
    pub salt: String,
}
