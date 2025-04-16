import { Tables } from "../../../database.types";

type AnnouncementItemData = Tables<"discussions">;

export interface AnnouncementItemProps
  extends Pick<AnnouncementItemData, "id" | "title" | "body"> {
  isDataLoaded: boolean;
}
