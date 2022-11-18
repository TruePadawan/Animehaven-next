import { Button, Modal, TextField } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../../supabase/config";
import { createProfile } from "../../../../../utilities/app-utilities";
import VerifyOTP from "./VerifyOTP";
import { Fragment } from "react";
import Loading from "../../../../Loading/Loading";
import useInput from "../../../../../hooks/use-input";

const Signup = ({
	showDialog,
	closeDialog,
	handleGoogleAuth,
	errorHandler,
}) => {
	const [displayName, setDisplayName] = useState("");
	const [formText, setFormText] = useState({ acctName: "", email: "" });
	const [OTPVerificationPending, setOTPVerificationPending] = useState(false);

	const processAccountNameValidation = useCallback(async function (value) {
		if (showDialog === false) return false;
		if (value.length >= 3) {
			const { data } = await supabase
				.from("profiles")
				.select()
				.eq("account_name", value);
			return data.length === 0;
		}
		return false;
	}, [showDialog]);

	const processEmailValidation = useCallback(async function (value) {
		if (showDialog === false) return false;
		if (value.length >= 4 && value.includes("@")) {
			const { data } = await supabase
				.from("profiles")
				.select()
				.eq("email", value);
			return data.length === 0;
		}
		return false;
	}, [showDialog]);

	const accountNameTransformation = (value) => {
		return value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
	};

	const {
		value: accountName,
		isValid: accountNameIsValid,
		hasError: accountNameHasError,
		changeHandler: accountNameChangeHandler,
		checkingValidity: checkingAcctNameValidity,
		blurHandler: accountNameBlurHandler,
	} = useInput(processAccountNameValidation, accountNameTransformation);

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
		if (
			checkingAcctNameValidity === true ||
			(!checkingAcctNameValidity && !accountNameHasError)
		) {
			setFormText((snapshot) => {
				return { ...snapshot, acctName: "" };
			});
		} else if (!checkingAcctNameValidity && accountNameHasError) {
			if (accountName.length >= 3) {
				setFormText((snapshot) => {
					return {
						...snapshot,
						acctName: "Account name is already taken",
					};
				});
			} else {
				setFormText((snapshot) => {
					return {
						...snapshot,
						acctName: "Account name is invalid!",
					};
				});
			}
		}
	}, [checkingAcctNameValidity, accountNameHasError, accountName]);
	
	useEffect(() => {
		if (
			checkingEmailValidity === true ||
			(!checkingEmailValidity && !emailHasError)
		) {
			setFormText((snapshot) => {
				return { ...snapshot, email: "" };
			});
		} else if (!checkingEmailValidity && emailHasError) {
			if (email.length >= 4 && email.includes("@")) {
				setFormText((snapshot) => {
					return {
						...snapshot,
						email: "Email has already been used!",
					};
				});
			} else {
				setFormText((snapshot) => {
					return {
						...snapshot,
						email: "Email is invalid!",
					};
				});
			}
		}
	}, [checkingEmailValidity, emailHasError, email]);

	const displayNameChangeHandler = (event) => {
		setDisplayName(event.target.value);
	};

	const handleSignup = async (event) => {
		event.preventDefault();
		try {
			if (accountNameIsValid === false || emailIsValid === false) {
				throw new Error(
					"Some values are invalid! Check the account name and email"
				);
			}
			const { error } = await supabase.auth.signInWithOtp({ email });
			if (error) throw error;
			else {
				setOTPVerificationPending(true);
			}
		} catch (error) {
			errorHandler("Signup process failed!", error);
		}
	};

	const completeSignup = async (authData) => {
		try {
			const uid = authData.user.id;
			const { error } = await createProfile({
				id: uid,
				account_name: accountName,
				display_name: displayName,
				email: email,
			});
			if (error) throw error;
			else {
				window.location.reload();
			}
		} catch (error) {
			errorHandler("Failed to complete signup and create profile", error);
		}
	};

	const processingInputValidity = checkingAcctNameValidity || checkingEmailValidity;
	const signupBtnDisabled = !accountNameIsValid || !emailIsValid;
	return (
		<Modal open={showDialog} onClose={closeDialog}>
			<div className="authDialog" onClick={(e) => e.stopPropagation()}>
				<h4 className="text-secondary">
					{OTPVerificationPending ? "Verify OTP" : "Sign Up"}
				</h4>
				{!OTPVerificationPending && (
					<form className="signupForm" onSubmit={handleSignup}>
						<Button startIcon={<GoogleIcon />} onClick={handleGoogleAuth}>
							Continue with Google
						</Button>
						<div className="d-flex flex-wrap gap-2 mb-2">
							<TextField
								variant="filled"
								label="Account Name"
								sx={{ flexGrow: "1" }}
								required
								placeholder="johndoe"
								value={accountName}
								error={accountNameHasError}
								onChange={accountNameChangeHandler}
								onBlur={accountNameBlurHandler}
								inputProps={{ minLength: 3, spellCheck: false }}
							/>
							<TextField
								variant="filled"
								label="Display Name"
								sx={{ flexGrow: "1" }}
								placeholder="John Doe"
								required
								inputProps={{ minLength: 3, spellCheck: false }}
								value={displayName}
								onChange={displayNameChangeHandler}
							/>
						</div>
						<TextField
							variant="filled"
							label="Email"
							type="email"
							required
							value={email}
							error={emailHasError}
							onBlur={emailBlurHandler}
							onChange={emailChangeHandler}
							inputProps={{ minLength: 4 }}
						/>
						{processingInputValidity && <Loading progressElAttr={{ size: 20 }} />}
						{!processingInputValidity && (
							<Fragment>
								<span className="form-helper-text">{formText.acctName}</span>
								<span className="form-helper-text">{formText.email}</span>
							</Fragment>
						)}
						<Button
							variant="contained"
							type="submit"
							disabled={signupBtnDisabled}>
							Sign Up
						</Button>
					</form>
				)}
				{OTPVerificationPending && (
					<VerifyOTP
						email={email}
						options={{ verificationType: "signup" }}
						onVerify={completeSignup}
						errorHandler={errorHandler}
					/>
				)}
			</div>
		</Modal>
	);
};

export default Signup;
