import {
  Alert,
  Slide,
  SlideProps,
  Snackbar,
  SnackbarCloseReason,
  SnackbarOrigin,
} from "@mui/material";
import React, { createContext, Fragment, useState } from "react";
import {
  NotificationContextProviderProps,
  NotificationContextType,
  NotificationState,
} from "./NotificationContext.types";
import { getErrorMessage } from "../../utilities/app-utilities";

/**
 * Allows its consumers to trigger notifications
 * */
export const NotificationContext = createContext<NotificationContextType>({
  showNotification: () => {},
});

export const NotificationContextProvider = (
  props: NotificationContextProviderProps,
) => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    severity: "info",
    text: "",
  });

  const resetNotification = (
    event?: React.SyntheticEvent<any> | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason !== "clickaway") {
      setNotification({
        open: false,
        severity: "info",
        text: "",
      });
    }
  };

  const showNotification: NotificationContextType["showNotification"] = (
    text,
    options,
  ) => {
    const notificationText = options?.error
      ? `${text} - ${getErrorMessage(options.error)}`
      : text;

    setNotification({
      open: true,
      severity: options?.severity ?? "info",
      text: notificationText,
    });
  };

  const alertAnchorOrigin: SnackbarOrigin = {
    vertical: "bottom",
    horizontal: "right",
  };
  return (
    <Fragment>
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={resetNotification}
        anchorOrigin={alertAnchorOrigin}
        TransitionComponent={SlideTransition}
      >
        <Alert
          variant={"filled"}
          severity={notification.severity}
          onClose={resetNotification}
          sx={{ width: "100%" }}
        >
          {notification.text}
        </Alert>
      </Snackbar>
      <NotificationContext.Provider value={{ showNotification }}>
        {props.children}
      </NotificationContext.Provider>
    </Fragment>
  );
};

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}
