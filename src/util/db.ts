import { Album, Artist, Song } from "@/types/Music";
import Database from "@tauri-apps/plugin-sql";
import { appDataDir, join } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/core";

async function getDb() {
  const db = await Database.load("sqlite:music.db");
  return db;
}

export async function getArtists() {
  const db = await getDb();
  const artists = await db.select<Artist[]>(
    "SELECT id, name FROM artists ORDER BY name COLLATE NOCASE ASC"
  );
  return artists;
}

export async function getAlbumsForArtist(artistId: string) {
  const appDataDirPath = await appDataDir();
  const db = await getDb();
  const albums = await db.select<Album[]>(
    "SELECT id, name, artist_id, artist_name, cover_art, year, duration FROM albums WHERE artist_id = ? ORDER BY year DESC",
    [artistId]
  );
  for (let i = 0; i < albums.length; i++) {
    const filePath = await join(
      appDataDirPath,
      "/cover_art/" + albums[i].cover_art
    );
    console.log("File path", filePath);
    const assetUrl = convertFileSrc(filePath);
    albums[i].cover_art = assetUrl;
  }
  return albums;
}

export async function getSongsForAlbum(albumId: string) {
  const appDataDirPath = await appDataDir();
  const db = await getDb();
  const songs = await db.select<Song[]>(
    "SELECT id, title, artist_id, artist_name, album_id, album_name, library_id, track, disc_number duration, content_type, cover_art FROM songs WHERE album_id = ? ORDER BY track ASC",
    [albumId]
  );
  for (let i = 0; i < songs.length; i++) {
    const filePath = await join(
      appDataDirPath,
      "/cover_art/" + songs[i].cover_art
    );
    const assetUrl = convertFileSrc(filePath);
    songs[i].cover_art = assetUrl;
  }
  return songs;
}
