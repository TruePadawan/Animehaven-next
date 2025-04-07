import {AlertProps} from "@mui/material";

export interface HasErrorMessage {
    message?: string;
    error_description?: string;
}

export interface TriggerAlertOptions {
    severity: AlertProps["severity"];
    error?: {
        message?: string;
        error_description?: string;
    }
}

export type TriggerAlert = (text: string, options?: TriggerAlertOptions) => void;