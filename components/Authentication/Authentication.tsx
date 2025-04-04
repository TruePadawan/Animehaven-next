import {Alert, Button, ButtonGroup, Snackbar, SnackbarOrigin, styled} from "@mui/material";
import {useContext, useState} from "react";
import {UserAuthContext} from "../../context/UserAuthContext";
import UserAccountBtn from "./UserAccountBtn";
import {Fragment} from "react";
import {useRouter} from "next/router";
import {HasErrorMessage} from "../../utilities/global.types";

const AuthBtn = styled(Button)(() => ({
    backgroundColor: "darkslategray",
    fontFamily: "inherit",
    "&:hover": {
        backgroundColor: "rgb(68, 115, 115)",
    },
}));

const Authentication = () => {
    const {profileID} = useContext(UserAuthContext);
    const [error, setError] = useState({occurred: false, text: ""});
    const router = useRouter();

    const handleError = (text: string, error: HasErrorMessage) => {
        setError({
            occurred: true,
            text: `${text} - ${error.message || error.error_description}`,
        });
    };

    const resetError = (event: React.SyntheticEvent<any> | Event, reason: string) => {
        if (reason === "clickaway") {
            return;
        }
        setError({occurred: false, text: ""});
    };

    const userSignedIn = profileID !== null;
    const alertAnchorOrigin: SnackbarOrigin = {
        vertical: "top",
        horizontal: "center",
    };
    return (
        <>
            {userSignedIn && (
                <UserAccountBtn profileID={profileID} errorHandler={handleError}/>
            )}
            {!userSignedIn && (
                <Fragment>
                    <ButtonGroup>
                        <AuthBtn variant="contained" onClick={() => router.push("/signup")}>
                            Sign Up
                        </AuthBtn>
                        <AuthBtn variant="contained" onClick={() => router.push("/signin")}>
                            Sign In
                        </AuthBtn>
                    </ButtonGroup>
                    <Snackbar
                        open={error.occurred}
                        autoHideDuration={6000}
                        onClose={resetError}
                        anchorOrigin={alertAnchorOrigin}>
                        <Alert severity="error" sx={{width: "100%"}}>
                            {error.text}
                        </Alert>
                    </Snackbar>
                </Fragment>
            )}
        </>
    );
};

export default Authentication;
