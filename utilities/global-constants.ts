import { SnackbarState } from "./global.types";

export const DEFAULT_SNACKBAR_STATE: SnackbarState = {
  open: false,
  severity: "info",
  text: "",
};
export const DEFAULT_AVATAR_URL =
  "https://bkpyhkkjvgzfjojacrka.supabase.co/storage/v1/object/public/avatars/noprofilepic.jpg";
export const LIST_GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Ecchi",
  "Horror",
  "Sports",
  "Supernatural",
  "Romance",
  "Suspense",
  "Fantasy",
  "Slice of Life",
  "Sci-Fi",
  "Boys Love",
];
export const DISCUSSION_TAGS = ["Chat", "Support"];
export const PROFILE_IMG_MAX_SIZE = Math.pow(10, 6);
export const ALLOWED_ANIME_TYPES = ["TV", "OVA", "Movie"];
export const FLAGGED_ANIME_GENRES = [
  "Hentai",
  "Boys Love",
  "Erotica",
  "Girls Love",
];
export const VALID_WATCH_STATUS = ["WATCHED", "WATCHING", "NOT_WATCHED"];
