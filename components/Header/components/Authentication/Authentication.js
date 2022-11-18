import { Alert, Button, ButtonGroup, Snackbar, styled } from "@mui/material";
import { useContext, useState } from "react";
import { UserAuthContext } from "../../../../context/UserAuthContext";
import UserAccountBtn from "../UserAccountBtn/UserAccountBtn";
import { supabase } from "../../../../supabase/config";
import { Fragment } from "react";
import Signup from "./components/Signup";
import Signin from "./components/Signin";

const AuthBtn = styled(Button)(() => ({
	backgroundColor: "darkslategray",
	fontFamily: "inherit",
	"&:hover": {
		backgroundColor: "rgb(68, 115, 115)",
	},
}));

const Authentication = () => {
	const { profileID } = useContext(UserAuthContext);
	const [error, setError] = useState({ occurred: false, text: "" });
	const [showSignupDialog, setShowSignupDialog] = useState(false);
	const [showSigninDialog, setShowSigninDialog] = useState(false);

	const handleError = (text, error) => {
		console.error(error);
		setError({
			occurred: true,
			text: `${text} - ${error.message || error.error_description}`,
		});
	};

	const closeSignupDialog = () => {
		setShowSignupDialog(false);
	};

	const closeSigninDialog = () => {
		setShowSigninDialog(false);
	};

	const handleGoogleAuth = async (e) => {
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
			});
			if (error !== null) {
				throw error;
			}
		} catch (error) {
			handleError("Google auth process failed!", error);
		}
	};

	const resetError = (event, reason) => {
		if (reason === "clickaway") {
			return;
		}
		setError({ occurred: false, text: "" });
	};

	const userSignedIn = profileID !== null;
	const alertAnchorOrigin = {
		vertical: "top",
		horizontal: "center",
	};
	return (
		<>
			{userSignedIn && <UserAccountBtn profileID={profileID} errorHandler={handleError} />}
			{!userSignedIn && (
				<Fragment>
					<ButtonGroup>
						<AuthBtn
							variant="contained"
							onClick={() => setShowSignupDialog(true)}>
							Sign Up
						</AuthBtn>
						<AuthBtn
							variant="contained"
							onClick={() => setShowSigninDialog(true)}>
							Sign In
						</AuthBtn>
					</ButtonGroup>
					<Signup
						showDialog={showSignupDialog}
						closeDialog={closeSignupDialog}
						handleGoogleAuth={handleGoogleAuth}
						errorHandler={handleError}
					/>
					<Signin
						showDialog={showSigninDialog}
						closeDialog={closeSigninDialog}
						handleGoogleAuth={handleGoogleAuth}
						errorHandler={handleError}
					/>
					<Snackbar
						open={error.occurred}
						autoHideDuration={6000}
						onClose={resetError}
						anchorOrigin={alertAnchorOrigin}>
						<Alert severity="error" sx={{ width: "100%" }} onClose={resetError}>
							{error.text}
						</Alert>
					</Snackbar>
				</Fragment>
			)}
		</>
	);
};

export default Authentication;
