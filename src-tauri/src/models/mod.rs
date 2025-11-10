use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;

#[derive(Serialize, Deserialize)]
pub struct LibraryConfig {
    pub id: String,
    pub name: String,
    pub host: String,
    pub port: Option<i16>,
    pub username: String,
    pub password: String,
}

#[derive(Serialize, Deserialize, Debug, FromRow)]
pub struct DBLibrary {
    pub id: String,
    pub name: String,
    pub host: String,
    pub port: Option<i16>,
    pub username: String,
    pub salt: String,
    pub last_scanned: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Library {
    pub id: String,
    pub name: String,
    pub host: String,
    pub port: Option<i16>,
    pub username: String,
    pub hashed_password: String,
    pub salt: String,
    pub last_scanned: String,
}

#[derive(Serialize, Deserialize, Debug, FromRow)]
pub struct Artist {
    pub id: String,
    pub name: String,
    pub library_id: String,
}

#[derive(Serialize, Deserialize, Debug, FromRow)]
pub struct Album {
    pub id: String,
    pub name: String,
    pub artist_id: String,
    pub artist_name: String,
    pub library_id: String,
    pub cover_art: String,
    pub year: Option<u32>,
    pub duration: u32,
}

#[derive(Serialize, Deserialize, Debug, FromRow)]
pub struct Song {
    pub id: String,
    pub title: String,
    pub artist_id: String,
    pub artist_name: String,
    pub album_id: String,
    pub album_name: String,
    pub library_id: String,
    pub track: Option<u32>,
    pub duration: Option<u32>,
    pub disc_number: u32,
    pub content_type: String,
    pub cover_art: String,
}

#[derive(Serialize, Deserialize, Debug, FromRow)]
pub struct Playlist {
    pub id: String,
    pub library_id: String,
    pub name: String,
    pub owner: String,
    pub created: String,
    pub modified: String,
    pub song_count: u32,
    pub duration: u32,
}

// #[derive(Serialize, Deserialize, Debug)]
// pub struct Tag {
//     pub id: String,
//     pub name: String,
//     pub description: Option<String>,
// }

// #[derive(Serialize, Deserialize, Debug)]
// pub struct AlbumTag {
//     pub id: String,
//     pub tag_id: String,
//     pub album_id: String,
// }
