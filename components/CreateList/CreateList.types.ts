import { Tables } from "../../database.types";

export interface CreateListProps {
  open: boolean;
  defaultValues?: Omit<Tables<"anime_lists">, "creator_id" | "created_at"> & {
    creator: string;
  };
  profileId: string;
  onClose: VoidFunction;
}

// TODO: make type global
export interface ListGenres {
  [key: string]: boolean;
}
