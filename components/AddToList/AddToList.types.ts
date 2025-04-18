import { Tables } from "../../database.types";
import { NotificationContextType } from "../../context/notifications/NotificationContext.types";

export interface AddToListAnimeListItemProps {
  id: number;
  itemData: Tables<"anime_lists">["items"][number];
  title: string;
  closeDialog: () => void;
  isPrivate: boolean;
  showNotification: NotificationContextType["showNotification"];
}

export interface AddToListProps {
  itemData: Tables<"anime_lists">["items"][number];
  profileID: string;
}

export type StrippedAnimeListItemData = Pick<
  Tables<"anime_lists">,
  "id" | "title" | "is_public"
>;
