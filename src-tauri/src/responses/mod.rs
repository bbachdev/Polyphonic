use serde::{Deserialize, Serialize};

/* General */
#[derive(Serialize, Deserialize, Debug)]
pub struct SubsonicResponse<T> {
    #[serde(rename = "subsonic-response")]
    pub data: T,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SubsonicBaseResponse {
    pub status: String,
    pub error: Option<SubsonicError>,
    pub version: String,
    pub server_version: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SubsonicError {
    pub code: u32,
    pub message: String,
}

/*******************************************************************************
 * Artists
 ******************************************************************************/
#[derive(Serialize, Deserialize, Debug)]
pub struct SubsonicGetArtistsResponse {
    #[serde(flatten)]
    pub base: SubsonicBaseResponse,
    pub artists: SubsonicArtistsID3,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SubsonicArtistsID3 {
    pub ignored_articles: String,
    pub index: Vec<SubsonicIndexID3>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SubsonicIndexID3 {
    pub name: String,
    pub artist: Vec<SubsonicArtistID3>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SubsonicArtistID3 {
    pub id: String,
    pub name: String,
}

/*******************************************************************************
 * Albums
 ******************************************************************************/
#[derive(Serialize, Deserialize, Debug)]
pub struct SubsonicGetAlbumsResponse {
    #[serde(flatten)]
    pub base: SubsonicBaseResponse,
    pub artist: SubsonicArtist,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SubsonicArtist {
    pub id: String,
    pub name: String,
    pub album: Vec<SubsonicAlbumID3>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SubsonicAlbumID3 {
    pub id: String,
    pub name: String,
    pub artist: String,
    pub artist_id: Option<String>,
    pub cover_art: String,
    pub duration: u32,
    pub year: Option<u32>,
}

/*******************************************************************************
 * Songs
 ******************************************************************************/
#[derive(Serialize, Deserialize, Debug)]
pub struct SubsonicGetSongsResponse {
    #[serde(flatten)]
    pub base: SubsonicBaseResponse,
    pub album: SubsonicAlbumID3WithSongs,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SubsonicAlbumID3WithSongs {
    pub id: String,
    pub name: String,
    pub cover_art: String,
    pub duration: u32,
    pub year: Option<u32>,
    pub song: Vec<SubsonicChild>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SubsonicChild {
    pub id: String,
    pub title: String,
    pub album_id: String,
    pub album: String,
    pub artist_id: Option<String>,
    pub artist: String,
    pub track: Option<u32>,
    pub disc_number: Option<u32>,
    pub duration: Option<u32>,
    pub content_type: String,
    pub cover_art: Option<String>,
}

/*******************************************************************************
 * AlbumList2
 ******************************************************************************/
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SubsonicGetAlbumList2Response {
    #[serde(flatten)]
    pub base: SubsonicBaseResponse,
    pub album_list_2: SubsonicAlbumList,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SubsonicAlbumList {
    pub album: Vec<SubsonicAlbumID3>,
}

/*******************************************************************************
 * Playlist
 ******************************************************************************/
#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SubsonicGetPlaylistsResponse {
    #[serde(flatten)]
    pub base: SubsonicBaseResponse,
    pub playlists: SubsonicPlaylistContainer,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SubsonicPlaylistContainer {
    pub playlist: Vec<SubsonicPlaylist>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SubsonicPlaylist {
    pub id: String,
    pub name: String,
    pub owner: String,
    pub created: String,
    pub changed: String,
    pub song_count: Option<u32>,
    pub duration: Option<u32>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SubsonicGetPlaylistResponse {
    #[serde(flatten)]
    pub base: SubsonicBaseResponse,
    pub playlist: SubsonicPlaylistDetails,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SubsonicPlaylistDetails {
    pub id: String,
    pub entry: Vec<SubsonicChild>,
}
