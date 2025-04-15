import {Button, TextField} from "@mui/material";
import Head from "next/head";
import React, {Fragment, useCallback, useEffect, useRef, useState} from "react";
import useInput from "../hooks/use-input";
import styles from "../styles/auth.module.css";
import {useRouter} from "next/router";
import {createProfile, hasProfile} from "../utilities/app-utilities";
import {createServerSupabaseClient} from "@supabase/auth-helpers-nextjs";
import {useSupabaseClient} from "@supabase/auth-helpers-react";
import {GetServerSidePropsContext} from "next";
import {Database} from "../database.types";
import {HasErrorMessage} from "../utilities/global.types";

function accountNameTransformation(text: string) {
    return text.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function generateAccountNameFromEmail(email: string) {
    const emailSubstrings = email.split("@")
    if (emailSubstrings.length > 0) {
        const emailName = emailSubstrings.at(0)
        return `${emailName}${Date.now()}`;
    } else {
        return `${email}${Date.now()}`;
    }
}

interface PageProps {
    userData: {
        profile_id: string,
        email: string,
        display_name: string,
        avatar_url?: string
    }
}

const AuthComplete = ({userData}: PageProps) => {
    const supabase = useSupabaseClient<Database>();
    const router = useRouter();
    const processAccountNameValidation = useCallback(async (value: string) => {
        if (value.length >= 3) {
            const {data, error} = await supabase
                .from("profiles")
                .select()
                .eq("account_name", value);
            if (error) return false
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
    const displayNameRef = useRef<HTMLInputElement>();

    useEffect(() => {
        setCreateProfileBtnDisabled(!accountNameIsValid);
    }, [accountNameIsValid]);

    // TODO: This should be a proper notification
    function handleError(errorText: string, error: HasErrorMessage) {
        alert(`${errorText} - ${error.message || error.error_description}`);
    }

    function disableButtons() {
        setCreateProfileBtnDisabled(true);
        setCancelAuthBtnDisabled(true);
    }

    function enableButtons() {
        setCreateProfileBtnDisabled(true);
        setCancelAuthBtnDisabled(true);
    }

    async function formSubmitHandler(event: React.FormEvent) {
        event.preventDefault();
        if (!accountNameIsValid || accountNameHasError) {
            alert("Account name is invalid");
            return;
        }
        try {
            disableButtons();
            const profileExists = await hasProfile(supabase, userData.profile_id);
            if (profileExists) throw new Error("Profile already exists");

            const profileData = {
                id: userData.profile_id,
                account_name: accountName,
                display_name: displayNameRef.current?.value ?? userData.display_name,
                email: userData.email,
                avatar_url: ""
            };
            if (userData?.avatar_url) {
                profileData.avatar_url = userData.avatar_url;
            }
            await createProfile(supabase, profileData);
            router.reload();
        } catch (error) {
            handleError("Failed to create profile", error as HasErrorMessage);
            enableButtons();
        }
    }

    async function cancelAuthentication() {
        disableButtons();
        try {
            await supabase.auth.signOut();
            router.reload();
        } catch (error) {
            handleError("Error occurred while signing out", error as HasErrorMessage);
            enableButtons();
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
                        inputProps={{minLength: 3}}
                        required
                    />
                    <TextField
                        className={styles["text-field"]}
                        variant="filled"
                        label="Display Name"
                        type="text"
                        defaultValue={userData.display_name}
                        inputRef={displayNameRef}
                        spellCheck={false}
                        inputProps={{minLength: 3}}
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

export const getServerSideProps = (async (context: GetServerSidePropsContext) => {
    const supabaseClient = createServerSupabaseClient<Database>(context);
    const {
        data: {session},
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
            display_name: session.user.user_metadata?.full_name ?? "Default User",
            avatar_url: undefined
        };
        if (session.user.user_metadata?.avatar_url) {
            userData.avatar_url = session.user.user_metadata.avatar_url;
        }
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
})
