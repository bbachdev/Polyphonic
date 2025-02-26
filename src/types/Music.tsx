type Artist = {
  id: string;
  name: string;
}

type Album = {
  id: string;
  name: string;
  artist_id: string;
  artist_name: string;
  cover_art: string;
  year: number;
  duration: number;
}

type Song = {
  id: string;
  title: string;
  artist_id: string;
  artist_name: string;
  album_id: string;
  album_name: string;
  library_id: string;
  track: number;
  duration: number;
  disc_number: number;
  path: string;
  content_type: string;
  cover_art: string;
}

type Playlist = {
  id: string;
  library_id: string;
  name: string;
  owner: string;
  created: string;
  modified: string;
  song_count: number;
  duration: number;
}

//Could be album, or playlist
type ListInfo = {
  title: string;
  author: string;
}

export type { Artist, Album, Song, Playlist, ListInfo }

export function song_sort(a: Song, b: Song) {
  if (a.disc_number !== b.disc_number) {
    return a.disc_number - b.disc_number;
  }
  return a.track - b.track;
}