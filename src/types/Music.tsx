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
  discNumber: number;
  path: string;
  content_type: string;
  cover_art: string;
}

export type { Artist, Album, Song }