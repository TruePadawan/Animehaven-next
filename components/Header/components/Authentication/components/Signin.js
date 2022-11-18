import { Button, Modal, TextField } from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import VerifyOTP from "./VerifyOTP";
import { supabase } from "../../../../../supabase/config";
import GoogleIcon from "@mui/icons-material/Google";
import Loading from "../../../../Loading/Loading";
import useInput from "../../../../../hooks/use-input";

const Signin = ({
	showDialog,
	closeDialog,
	handleGoogleAuth,
	errorHandler,
}) => {
	const [OTPVerificationPending, setOTPVerificationPending] = useState(false);
	const [formText, setFormText] = useState("");
	
	// CHECK IF THERE IS ANY ACCOUNT WITH SPECIFIED EMAIL
	const processEmailValidation = useCallback(async function (value) {
		if (showDialog === false) return false;
		if (value.length >= 4 && value.includes("@")) {
			const { data } = await supabase
				.from("profiles")
				.select()
				.eq("email", value);
			return data.length !== 0;
		}
		return false;
	}, [showDialog]);

	const {
		value: email,
		isValid: emailIsValid,
		hasError: emailHasError,
		changeHandler: emailChangeHandler,
		checkingValidity: checkingEmailValidity,
		blurHandler: emailBlurHandler
	} = useInput(processEmailValidation);

	// CLEAR FORM TEXT IF VALIDITY IS BEING PROCESSED OR WHEN INPUT HAS NO ERROR
	useEffect(() => {
		if (checkingEmailValidity || (!checkingEmailValidity && !emailHasError)) {
			setFormText("");
		} else if (!checkingEmailValidity && emailHasError) {
			if (email.length >= 4 && email.includes("@")) {
				setFormText("No Account associated with specified Email");
			} else {
				setFormText("Email is invalid!");
			}
		}
	}, [checkingEmailValidity, emailHasError, email]);

	const handleSignin = async (event) => {
		event.preventDefault();
		try {
			if (emailIsValid === false) {
				throw new Error("Invalid email specified");
			}
			const { error } = await supabase.auth.signInWithOtp({ email });
			if (error !== null) {
				throw error;
			} else {
				setOTPVerificationPending(true);
			}
		} catch (error) {
			errorHandler("Signin process failed!", error);
		}
	};

	const signinBtnDisabled = emailIsValid === false;
	return (
		<Modal open={showDialog} onClose={closeDialog}>
			<div className="authDialog" onClick={(e) => e.stopPropagation()}>
				<h4 className="text-secondary">Sign In</h4>
				{!OTPVerificationPending && (
					<form className="signupForm" onSubmit={handleSignin}>
						<Button startIcon={<GoogleIcon />} onClick={handleGoogleAuth}>
							Continue with Google
						</Button>
						<TextField
							variant="filled"
							label="Email"
							type="email"
							error={emailHasError}
							required
							value={email}
							onBlur={emailBlurHandler}
							onChange={emailChangeHandler}
							inputProps={{ minLength: 4 }}
						/>
						{checkingEmailValidity && <Loading progressElAttr={{ size: 20 }} />}
						{!checkingEmailValidity && (
							<span className="form-helper-text">{formText}</span>
						)}
						<Button
							variant="contained"
							type="submit"
							disabled={signinBtnDisabled}>
							Sign In
						</Button>
					</form>
				)}
				{OTPVerificationPending && (
					<VerifyOTP
						email={email}
						options={{ verificationType: "magiclink" }}
						errorHandler={errorHandler}
						onVerify={() => closeDialog()}
					/>
				)}
			</div>
		</Modal>
	);
};

export default Signin;
