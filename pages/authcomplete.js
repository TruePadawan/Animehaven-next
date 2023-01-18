import { Button, TextField } from "@mui/material";
import Head from "next/head";
import { Fragment, useCallback } from "react";
import useInput from "../hooks/use-input";
import styles from "../styles/auth.module.css";
import { useRouter } from "next/router";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { createProfile, hasProfile } from "../utilities/app-utilities";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

function accountNameTransformation(text) {
	return text.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function generateAccountNameFromEmail(email) {
	const emailName = email.split("@").at(0).toLowerCase();
	return `${emailName}${Date.now()}`;
}

const AuthComplete = ({ userData }) => {
	const supabase = useSupabaseClient();
	const router = useRouter();
	const processAccountNameValidation = useCallback(async (value) => {
		if (value.length >= 3) {
			const { data } = await supabase
				.from("profiles")
				.select()
				.eq("account_name", value);
			return data.length === 0;
		}
		return false;
	}, []);
	const {
		value: accountName,
		isValid: accountNameIsValid,
		hasError: accountNameHasError,
		changeHandler: accountNameChangeHandler,
	} = useInput(processAccountNameValidation, {
		customTransformation: accountNameTransformation,
		defaultValue: generateAccountNameFromEmail(userData.email),
	});
	const [createProfileBtnDisabled, setCreateProfileBtnDisabled] = useState(
		!accountNameIsValid
	);
	const [cancelAuthBtnDisabled, setCancelAuthBtnDisabled] = useState(false);
	const displayNameRef = useRef();

	useEffect(() => {
		setCreateProfileBtnDisabled(!accountNameIsValid);
	}, [accountNameIsValid]);

	async function formSubmitHandler(event) {
		event.preventDefault();
		if (!accountNameIsValid || accountNameHasError) {
			alert("Account name is invalid");
			return;
		}
		try {
			setCreateProfileBtnDisabled(true);
			setCancelAuthBtnDisabled(true);
			const profileExists = await hasProfile(supabase, userData.profile_id);
			if (profileExists) throw new Error("Profile already exists");
			await createProfile({
				id: userData.profile_id,
				account_name: accountName,
				display_name: displayNameRef.current.value,
				email: userData.email,
			});
			router.reload();
		} catch (error) {
			alert(
				`Failed to create profile - ${error.message || error.error_description}`
			);
			setCreateProfileBtnDisabled(false);
			setCancelAuthBtnDisabled(false);
		}
	}

	async function cancelAuthentication() {
		setCreateProfileBtnDisabled(true);
		setCancelAuthBtnDisabled(true);
		try {
			await supabase.auth.signOut();
			router.reload();
		} catch (error) {
			alert(
				`Error occurred while signing out - ${error.message || error.error_description}`
			);
			setCreateProfileBtnDisabled(false);
			setCancelAuthBtnDisabled(false);
		}
	}

	return (
		<Fragment>
			<Head>
				<title>Animehaven | Create Profile</title>
			</Head>
			<main className="d-flex flex-column justify-content-center align-items-center h-100 p-2">
				<h1 className="mb-4">Create Profile</h1>
				<form
					className={styles["auth-complete-form"]}
					onSubmit={formSubmitHandler}>
					<TextField
						className={styles["text-field"]}
						variant="filled"
						label="Account Name"
						type="text"
						value={accountName}
						onChange={accountNameChangeHandler}
						spellCheck={false}
						inputProps={{ minLength: 3 }}
						required
					/>
					<TextField
						className={styles["text-field"]}
						variant="filled"
						label="Display Name"
						type="text"
						defaultValue={userData.d_name}
						inputRef={displayNameRef}
						spellCheck={false}
						inputProps={{ minLength: 3 }}
						required
					/>
					{accountNameHasError && (
						<span className="form-helper-text">Account Name is Taken!</span>
					)}
					<Button
						variant="contained"
						type="submit"
						disabled={createProfileBtnDisabled}>
						Create Profile
					</Button>
					<Button
						variant="contained"
						color="error"
						type="button"
						disabled={cancelAuthBtnDisabled}
						onClick={cancelAuthentication}>
						Cancel Authentication
					</Button>
				</form>
			</main>
		</Fragment>
	);
};

export default AuthComplete;

export async function getServerSideProps(context) {
	const supabaseClient = createServerSupabaseClient(context);
	const {
		data: { session },
	} = await supabaseClient.auth.getSession();

	if (!session)
		return {
			redirect: {
				destination: "/signup",
				permanent: false,
			},
		};
	const profileExists = await hasProfile(supabaseClient, session.user.id);
	if (!profileExists) {
		const userData = {
			profile_id: session.user.id,
			email: session.user.email,
			d_name: session.user.user_metadata?.full_name ?? "Default User",
		};
		return {
			props: {
				userData,
			},
		};
	} else {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
	}
}
