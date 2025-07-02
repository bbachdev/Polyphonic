export interface Config {
  theme: string;
  libraries: Library[]
  discord_rp: boolean;
  albumSortDefault: AlbumSort;
  albumSortArtist: AlbumSort;
}

export interface LibraryConfig {
  id: string;
  name: string;
  host: string;
  port?: number;
  username: string;
  password: string;
}

export interface Library {
  id: string;
  name: string;
  host: string;
  port?: number;
  username: string;
  hashed_password?: string;
  salt: string;
  last_scanned?: string;
}

export enum SortType {
  ALPHABETICAL,
  RELEASE_YEAR,
  RECENTLY_PLAYED,
  RECENTLY_ADDED
}

export enum SortDirection {
  ASC,
  DESC
}

export interface AlbumSort {
  sortType: SortType;
  direction: SortDirection;
}