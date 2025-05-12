import { Album, Artist, Playlist, Song, song_sort, Tag, AlbumTag } from "@/types/Music";
import Database from "@tauri-apps/plugin-sql";
import { appDataDir, join } from "@tauri-apps/api/path";
import { convertFileSrc, invoke } from "@tauri-apps/api/core";
import { Library } from '@/types/Config';

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
    const assetUrl = convertFileSrc(filePath);
    albums[i].cover_art = assetUrl;
  }
  return albums;
}

export async function getSongsForAlbum(albumId: string) {
  const appDataDirPath = await appDataDir();
  const db = await getDb();
  const songs = await db.select<Song[]>(
    "SELECT id, title, artist_id, artist_name, album_id, album_name, library_id, track, disc_number, duration, content_type, cover_art FROM songs WHERE album_id = ? ORDER BY track ASC",
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

  //Sort by disc number
  songs.sort(song_sort);

  return songs;
}

export async function getAlbumsById(albumIds: string[]) {
  const appDataDirPath = await appDataDir();
  const db = await getDb();
  let albumIdsWithQuotes = albumIds.map((id) => `"${id}"`);
  let albumQuery =
    "SELECT id, name, artist_id, artist_name, cover_art, year, duration FROM albums WHERE id IN (" +
    albumIdsWithQuotes.join(",") +
    ")";
  const albums = await db.select<Album[]>(albumQuery);
  for (let i = 0; i < albums.length; i++) {
    const filePath = await join(
      appDataDirPath,
      "/cover_art/" + albums[i].cover_art
    );
    const assetUrl = convertFileSrc(filePath);
    albums[i].cover_art = assetUrl;
  }

  //Sort albums
  const ids = albumIds.reduce((map, id, i) => map.set(id, i), new Map());
  albums.sort((a, b) => ids.get(a.id) - ids.get(b.id));
  return albums;
}

//Playlist-related
export async function getPlaylists() {
  const db = await getDb();
  let playlistQuery =
    "SELECT id, library_id, name, owner, created, modified, song_count, duration FROM playlists ORDER BY name COLLATE NOCASE ASC";
  const playlists: Playlist[] = await db.select<Playlist[]>(playlistQuery);
  return playlists
}

export async function getTags() {
  const db = await getDb();
  let tagQuery = "SELECT id, name, description FROM tags ORDER BY name COLLATE NOCASE ASC";
  const tags: Tag[] = await db.select<Tag[]>(tagQuery);
  return tags;
}

export async function getTagsByAlbum(albumId: string) {
  const db = await getDb();
  let tagQuery = "SELECT tag_id FROM album_tags WHERE album_id = ?";
  const tags: AlbumTag[] = await db.select<AlbumTag[]>(tagQuery, [albumId]);
  return tags;
}

export async function getAlbumsByTag(tagId: string) {
  const appDataDirPath = await appDataDir();
  const db = await getDb();
  const albums = await db.select<Album[]>(
    "SELECT id, name, artist_id, artist_name, cover_art, year, duration FROM albums WHERE id IN (SELECT album_id FROM album_tags WHERE tag_id = ?) ORDER BY name ASC",
    [tagId]
  );
  for (let i = 0; i < albums.length; i++) {
    const filePath = await join(
      appDataDirPath,
      "/cover_art/" + albums[i].cover_art
    );
    const assetUrl = convertFileSrc(filePath);
    albums[i].cover_art = assetUrl;
  }
  return albums;
}

export async function getSongsFromPlaylist(library: Library, playlist_id: string) {
  const appDataDirPath = await appDataDir();
  //Invoke, then get song data from DB
  let song_ids = await invoke('get_songs_for_playlist', { library: library, playlistId: playlist_id }) as string[]

  let songIdsWithQuotes = song_ids.map((id) => `"${id}"`);
  const db = await getDb();
  let songQuery =
    "SELECT id, library_id, title, artist_id, artist_name, album_id, album_name, track, disc_number, duration, content_type, cover_art FROM songs WHERE id IN (" +
    songIdsWithQuotes.join(",") +
  ")";

  const songs: Song[] = await db.select<Song[]>(songQuery, [playlist_id]);
  for (let i = 0; i < songs.length; i++) {
    const filePath = await join(
      appDataDirPath,
      "/cover_art/" + songs[i].cover_art
    );
    const assetUrl = convertFileSrc(filePath);
    songs[i].cover_art = assetUrl;
  }

  //Sort songs
  const ids = song_ids.reduce((map, id, i) => map.set(id, i), new Map());
  songs.sort((a, b) => ids.get(a.id) - ids.get(b.id));

  return songs
}

export async function createTags(tags: string[]) {
  const db = await getDb();
  for(let tag of tags) {
    await db.execute("INSERT OR IGNORE INTO tags (id, name) VALUES (? , ?)", [tag, tag]);
  }
}

export async function createAlbumTags(albumId: string, tags: string[]) {
  const db = await getDb();
  for(let tag of tags) {
    await db.execute("INSERT INTO album_tags (album_id, tag_id) VALUES (? , ?) ON CONFLICT DO NOTHING", [albumId, tag]);
  }

  //Delete old tags
  await db.execute("DELETE FROM album_tags WHERE album_id = ? AND tag_id NOT IN ('" + tags.join("','") + "')", [albumId]);
}

export async function resyncCollection() {
  const db = await getDb();
  await db.execute("DELETE FROM albums");
  await db.execute("DELETE FROM artists");
  await db.execute("DELETE FROM playlists");
  await db.execute("DELETE FROM songs");
  await db.execute("DELETE FROM tags");
  await db.execute("DELETE FROM album_tags");
}