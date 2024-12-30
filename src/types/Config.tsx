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
  salt: string;
}