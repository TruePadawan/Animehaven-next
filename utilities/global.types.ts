import { parseAnime } from "./app-utilities";

export interface HasErrorMessage {
  message?: string;
  error_description?: string;
}

export type ParsedAnime = ReturnType<typeof parseAnime>;

export type WatchStatus = "NOT_WATCHED" | "WATCHING" | "WATCHED";
