import { AlertProps } from "@mui/material";
import React from "react";
import { getRelevantAnimeData } from "./app-utilities";

export interface HasErrorMessage {
  message?: string;
  error_description?: string;
}

export interface TriggerAlertOptions {
  severity: AlertProps["severity"];
  error?: HasErrorMessage;
}

export type TriggerAlert = (
  text: string,
  options?: TriggerAlertOptions,
) => void;
export type ResetAlert = (
  event: React.SyntheticEvent<any> | Event,
  reason: string,
) => void;

export type AnimeItemData = ReturnType<typeof getRelevantAnimeData>;

export interface SnackbarState {
  open: boolean;
  severity: AlertProps["severity"];
  text: string;
}

export type WatchStatus = "NOT_WATCHED" | "WATCHING" | "WATCHED";
