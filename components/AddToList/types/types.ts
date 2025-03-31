import {AlertProps} from "@mui/material";

interface TriggerAlertOptions {
    severity: AlertProps["severity"];
    error?: {
        message?: string;
        error_description?: string;
    }
}

export interface AnimeListItemProps {
    id: number;
    itemData: {
        id: number;
        name: string;
    };
    title: string;
    triggerAlert: (text: string, options?: TriggerAlertOptions) => void;
    closeDialog: () => void;
    isPrivate: boolean;
}