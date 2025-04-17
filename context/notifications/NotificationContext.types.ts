import { AlertProps } from "@mui/material";
import { HasErrorMessage } from "../../utilities/global.types";
import { ReactNode } from "react";

export interface NotificationContextType {
  showNotification: (text: string, options?: ShowNotificationOptions) => void;
}

export interface ShowNotificationOptions {
  severity: AlertProps["severity"];
  error?: HasErrorMessage;
}

export interface NotificationContextProviderProps {
  children: ReactNode;
}

export interface NotificationState {
  open: boolean;
  severity: AlertProps["severity"];
  text: string;
}
