import { Library } from "@/types/Config";
import { Song } from "@/types/Music";
import { invoke } from "@tauri-apps/api/core";

export async function stream(
  song: Song,
  library: Library
): Promise<string | undefined> {
  // Determine file extension from content type
  let fileExtension = "mp3"; // default
  if (song.content_type.includes("flac")) {
    fileExtension = "flac";
  } else if (song.content_type.includes("ogg")) {
    fileExtension = "ogg";
  } else if (song.content_type.includes("wav")) {
    fileExtension = "wav";
  } else if (song.content_type.includes("m4a") || song.content_type.includes("mp4")) {
    fileExtension = "m4a";
  }

  try {
    // Stream song to temp file
    await invoke<string>("stream_song_to_file", {
      library: library,
      songId: song.id,
      fileExtension: fileExtension,
    });

    // On Linux, use embedded HTTP server for webkit2gtk compatibility
    // On other platforms, could use convertFileSrc but HTTP works everywhere
    return `http://127.0.0.1:38291/temp_audio/${song.id}.${fileExtension}`;
  } catch (error) {
    console.error("Failed to stream song:", error);
    return undefined;
  }
}

export async function scrobble(
  songId: string,
  library: Library
): Promise<boolean> {
  let host = library.host + (library.port !== -1 ? `:${library.port}` : "");
  let connectionString = `${host}/rest/scrobble.view?id=${songId}&u=${library.username}&t=${library.hashed_password}&s=${library.salt}&v=1.16.1&c=tauri&f=json`;

  const res = await fetch(connectionString);
  const data = await res.json();

  return data["subsonic-response"].status === "ok";
}

export async function library_modified(libraries: Library[]): Promise<boolean> {
  //TODO: Support multiple libraries
  try{
    let library = libraries[0];
    let host = library.host + (library.port !== -1 ? `:${library.port}` : "");
    
    let connectionString = `${host}/rest/getIndexes.view?ifModifiedSince=${library.last_scanned}&u=${library.username}&t=${library.hashed_password}&s=${library.salt}&v=1.16.1&c=tauri&f=json`;

    console.log("Connection String: ", connectionString)

    const res = await fetch(connectionString);
    const data = await res.json();

    let indexData = data["subsonic-response"].indexes;

    console.log("Index data", indexData)

    library.last_scanned = ""+indexData.lastModified;

    if(indexData.hasOwnProperty("index")) {
        //Save libraries to DB
      let libraryMap = new Map<string, String>();
      libraryMap.set(library.id, ""+library.last_scanned!);
      // let result = await invoke('update_library_modified', { data: libraryMap})
      // console.log("Result", result)
      return true
    }

    return false
  }catch(e) {
    console.log("Error", e)
    return false
  }
}
