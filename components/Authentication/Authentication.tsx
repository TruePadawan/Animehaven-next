import { Alert, Snackbar, SnackbarOrigin } from "@mui/material";
import { Fragment, useContext, useState } from "react";
import { UserAuthContext } from "../../context/UserAuthContext";
import ProfileMenuButton from "./ProfileMenuButton";
import { HasErrorMessage, ResetAlert } from "../../utilities/global.types";
import OAuthButton from "./OAuthButton";

const Authentication = () => {
  const { profileID } = useContext(UserAuthContext);
  const [error, setError] = useState({ occurred: false, text: "" });

  const handleError = (text: string, error: HasErrorMessage) => {
    setError({
      occurred: true,
      text: `${text} - ${error.message || error.error_description}`,
    });
  };

  const resetError: ResetAlert = (event, reason) => {
    if (reason !== "clickaway") {
      setError({ occurred: false, text: "" });
    }
  };

  const userSignedIn = profileID !== undefined;
  const alertAnchorOrigin: SnackbarOrigin = {
    vertical: "top",
    horizontal: "center",
  };
  return (
    <>
      {userSignedIn && (
        <ProfileMenuButton profileID={profileID} errorHandler={handleError} />
      )}
      {!userSignedIn && (
        <Fragment>
          <OAuthButton />
          <Snackbar
            open={error.occurred}
            autoHideDuration={6000}
            onClose={resetError}
            anchorOrigin={alertAnchorOrigin}
          >
            <Alert severity="error" sx={{ width: "100%" }}>
              {error.text}
            </Alert>
          </Snackbar>
        </Fragment>
      )}
    </>
  );
};

export default Authentication;
