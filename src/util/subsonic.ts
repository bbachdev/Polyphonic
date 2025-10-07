import { Library } from "@/types/Config";
import { Song } from "@/types/Music";

export async function stream(
  song: Song,
  library: Library,
  abortSignal?: AbortSignal
): Promise<string | undefined> {
  let host = "";
  let connectionString = "";

  host = library.host + (library.port !== -1 ? `:${library.port}` : "");
  connectionString = `${host}/rest/stream.view?id=${song.id}&u=${library.username}&t=${library.hashed_password}&s=${library.salt}&v=1.16.1&c=tauri&f=json`;

  const res = await fetch(connectionString, { signal: abortSignal });
  const buffer = await res.arrayBuffer();

  return URL.createObjectURL(new Blob([buffer], { type: song.content_type }));
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
