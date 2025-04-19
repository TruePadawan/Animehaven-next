import { getRelevantAnimeData } from "./app-utilities";

export interface HasErrorMessage {
  message?: string;
  error_description?: string;
}

export type AnimeItemData = ReturnType<typeof getRelevantAnimeData>;

export type WatchStatus = "NOT_WATCHED" | "WATCHING" | "WATCHED";
