import {AlertProps} from "@mui/material";
import {Tables} from "../../database.types";

interface TriggerAlertOptions {
    severity: AlertProps["severity"];
    error?: {
        message?: string;
        error_description?: string;
    }
}

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