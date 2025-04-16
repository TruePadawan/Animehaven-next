import { Tables } from "../../database.types";
import { TriggerAlert } from "../../utilities/global.types";

export interface AnimeListItemProps {
  id: number;
  itemData: Tables<"anime_lists">["items"][number];
  title: string;
  triggerAlert: TriggerAlert;
  closeDialog: () => void;
  isPrivate: boolean;
}

export interface AddToListProps {
  itemData: Tables<"anime_lists">["items"][number];
  profileID: string;
  triggerAlert: TriggerAlert;
}

export type StrippedAnimeListItemData = Pick<
  Tables<"anime_lists">,
  "id" | "title" | "is_public"
>;
