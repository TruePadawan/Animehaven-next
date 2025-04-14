import { useState, useEffect, useCallback, useContext, Fragment } from "react";
import { Button, TextField, Snackbar, Alert } from "@mui/material";
import VerifyOTP from "../components/Authentication/VerifyOTP";
import GoogleIcon from "@mui/icons-material/Google";
import Loading from "../components/Loading/Loading";
import useInput from "../hooks/use-input";
import { UserAuthContext } from "../context/UserAuthContext";
import { useRouter } from "next/router";
import Head from "next/head";
import styles from "../styles/auth.module.css";
import Link from "next/link";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import HeaderLayout from "../components/HeaderLayout/HeaderLayout";

export default function SignIn() {
	const supabase = useSupabaseClient();
	const { handleGoogleAuth, profileID } = useContext(UserAuthContext);
	const [error, setError] = useState({ occurred: false, text: "" });
	const [OTPVerificationPending, setOTPVerificationPending] = useState(false);
	const [formText, setFormText] = useState("");
	const router = useRouter();

	useEffect(() => {
        if (profileID !== undefined) {
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

	// CHECK IF THERE IS ANY ACCOUNT WITH SPECIFIED EMAIL
	const processEmailValidation = useCallback(async function (value) {
		if (value.length >= 4 && value.includes("@")) {
			const { data } = await supabase
				.from("profiles")
				.select()
				.eq("email", value);
			return data.length !== 0;
		}
		return false;
	}, []);

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
			handleError("Signin process failed!", error);
		}
	};

	const signinBtnDisabled = emailIsValid === false;
	const alertAnchorOrigin = {
		vertical: "top",
		horizontal: "center",
	};
	return (
		<Fragment>
			<Head>
				<title>Animehaven | Sign In</title>
			</Head>
			<div className={styles["auth-container"]}>
				{!OTPVerificationPending && (
					<form className={styles["auth-form"]} onSubmit={handleSignin}>
						<h4 className="text-white fs-2 text-center mb-4">Sign In</h4>
						<Button startIcon={<GoogleIcon />} onClick={handleGoogleAuth}>
							Continue with Google
						</Button>
						<TextField
							className={styles["text-field"]}
							variant="filled"
							label="Email"
							type="email"
							error={emailHasError}
							value={email}
							onBlur={emailBlurHandler}
							onChange={emailChangeHandler}
							inputProps={{ minLength: 4 }}
							required
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
						<p className="mt-4">
							No Account? <Link href="/signup" className={styles["auth-form-link"]}>Sign Up</Link>
						</p>
					</form>
				)}
				{OTPVerificationPending && (
					<VerifyOTP
						email={email}
						options={{ verificationType: "magiclink" }}
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

SignIn.getLayout = (page) => {
	return (
		<HeaderLayout>
			{page}
		</HeaderLayout>
	)
}
