type Artist = {
  id: string;
  name: string;
}

type Album = {
  id: string;
  name: string;
  artistId: string;
  artistName: string;
  coverArt: string;
  year: number;
  duration: number;
}

type Song = {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  albumId: string;
  albumName: string;
  track: number;
  duration: number;
  discNumber: number;
}

export type { Artist, Album, Song }