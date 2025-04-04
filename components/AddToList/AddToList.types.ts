import {Tables} from "../../database.types";
import {TriggerAlertOptions} from "../../utilities/global.types";


export interface AnimeListItemProps {
    id: number;
    itemData: Tables<"anime_lists">["items"][number];
    title: string;
    triggerAlert: (text: string, options?: TriggerAlertOptions) => void;
    closeDialog: () => void;
    isPrivate: boolean;
}

export interface AddToListProps {
    itemData: Tables<"anime_lists">["items"][number];
    profileID: string;
    triggerAlert: AnimeListItemProps["triggerAlert"];
}

export type StrippedAnimeListItemData = Pick<Tables<"anime_lists">, "id" | "title" | "is_public">