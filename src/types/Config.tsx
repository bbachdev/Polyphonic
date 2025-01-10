export interface Config {
  theme: string;
  libraries: Library[]
  discord_rp: boolean;
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