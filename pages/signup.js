import { Button, TextField, Snackbar, Alert } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useState, useEffect, useCallback, Fragment, useContext } from "react";
import { createProfile } from "../utilities/app-utilities";
import VerifyOTP from "../components/Authentication/VerifyOTP";
import Loading from "../components/Loading/Loading";
import useInput from "../hooks/use-input";
import { UserAuthContext } from "../context/UserAuthContext";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/auth.module.css";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function SignUp() {
	const supabase = useSupabaseClient();
	const { handleGoogleAuth, profileID } = useContext(UserAuthContext);
	const [displayName, setDisplayName] = useState("");
	const [formText, setFormText] = useState({ acctName: "", email: "" });
	const [error, setError] = useState({ occurred: false, text: "" });
	const [OTPVerificationPending, setOTPVerificationPending] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (profileID !== null) {
			router.replace("/");
		}
	}, [profileID]);

	const handleError = (text, error) => {
		setError({
			occurred: true,
			text: `${text} - ${error.message || error.error_description}`,
		});
	};

	const resetError = (event, reason) => {
		if (reason === "clickaway") {
			return;
		}
		setError({ occurred: false, text: "" });
	};

	const processAccountNameValidation = useCallback(async function (value) {
		if (value.length >= 3) {
			const { data } = await supabase
				.from("profiles")
				.select()
				.eq("account_name", value);
			return data.length === 0;
		}
		return false;
	}, []);

	const processEmailValidation = useCallback(async function (value) {
		if (value.length >= 4 && value.includes("@")) {
			const { data } = await supabase
				.from("profiles")
				.select()
				.eq("email", value);
			return data.length === 0;
		}
		return false;
	}, []);

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
	} = useInput(processAccountNameValidation, {
		customTransformation: accountNameTransformation,
	});

	const {
		value: email,
		isValid: emailIsValid,
		hasError: emailHasError,
		changeHandler: emailChangeHandler,
		checkingValidity: checkingEmailValidity,
		blurHandler: emailBlurHandler,
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
			handleError("Signup process failed!", error);
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
			router.reload();
		} catch (error) {
			handleError("Failed to complete signup and create profile", error);
		}
	};

	const alertAnchorOrigin = {
		vertical: "top",
		horizontal: "center",
	};
	const processingInputValidity =
		checkingAcctNameValidity || checkingEmailValidity;
	const signupBtnDisabled = !accountNameIsValid || !emailIsValid;
	return (
		<Fragment>
			<Head>
				<title>Animehaven | Sign Up</title>
			</Head>
			<div className={styles["auth-container"]}>
				{!OTPVerificationPending && (
					<form className={styles["auth-form"]} onSubmit={handleSignup}>
						<h4 className="text-white fs-2 text-center mb-4">Sign Up</h4>
						<Button startIcon={<GoogleIcon />} onClick={handleGoogleAuth}>
							Continue with Google
						</Button>
						<div className="d-flex flex-wrap gap-2 mb-2">
							<TextField
								className={styles["text-field"]}
								variant="filled"
								label="Account Name"
								sx={{ flexGrow: "1" }}
								placeholder="johndoe"
								value={accountName}
								error={accountNameHasError}
								onChange={accountNameChangeHandler}
								onBlur={accountNameBlurHandler}
								inputProps={{ minLength: 3, spellCheck: false }}
								required
							/>
							<TextField
								className={styles["text-field"]}
								variant="filled"
								label="Display Name"
								sx={{ flexGrow: "1" }}
								placeholder="John Doe"
								inputProps={{ minLength: 3, spellCheck: false }}
								value={displayName}
								onChange={displayNameChangeHandler}
								required
							/>
						</div>
						<TextField
							className={styles["text-field"]}
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
						{processingInputValidity && (
							<Loading progressElAttr={{ size: 20 }} />
						)}
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
						<p className="mt-4">
							Already have an account?{" "}
							<Link href="/signin" className={styles["auth-form-link"]}>
								Sign In
							</Link>
						</p>
					</form>
				)}
				{OTPVerificationPending && (
					<VerifyOTP
						email={email}
						options={{ verificationType: "signup" }}
						onVerify={completeSignup}
						onCancel={() => router.reload()}
						handleError={handleError}
					/>
				)}
			</div>
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
	);
}
