import {AlertProps} from "@mui/material";
import React from "react";

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
export type ResetAlert = (event: React.SyntheticEvent<any> | Event, reason: string) => void;

export interface AnimeItemData {
    id: number;
    title: string;
    imageURL: string;
    type: string;
    score: number;
    genres: Array<{
        mal_id: number;
        type: string;
        name: string;
        url: string;
    }>;
}