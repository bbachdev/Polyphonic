import { Artist } from "@/types/Music";
import Database from "@tauri-apps/plugin-sql";

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
