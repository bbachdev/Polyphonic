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
  track: number;
  duration: number;
  discNumber: number;
  path: string;
}

export type { Artist, Album, Song }