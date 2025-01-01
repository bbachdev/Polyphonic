import { Library } from "@/types/Config";
import { Song } from "@/types/Music";
import { convertFileSrc } from "@tauri-apps/api/core";

export async function stream(
  song: Song,
  library: Library
): Promise<string | undefined> {
  let host = "";
  let connectionString = "";

  host = library.host + (library.port !== -1 ? `:${library.port}` : "");
  connectionString = `${host}/rest/stream.view?id=${song.id}&u=${library.username}&t=${library.hashed_password}&s=${library.salt}&v=1.16.1&c=tauri&f=json`;

  console.log("Connection string", connectionString);
  const res = await fetch(connectionString);
  const buffer = await res.arrayBuffer();

  return URL.createObjectURL(new Blob([buffer], { type: song.content_type }));
}

export async function scrobble(
  songId: string,
  library: Library
): Promise<boolean> {
  let host = library.host + (library.port ? `:${library.port}` : "");
  let connectionString = `${host}/rest/scrobble.view?id=${songId}&u=${library.username}&t=${library.hashed_password}&s=${library.salt}&v=1.16.1&c=tauri&f=json`;

  const res = await fetch(connectionString);
  const data = await res.json();

  return data["subsonic-response"].status === "ok";
}
