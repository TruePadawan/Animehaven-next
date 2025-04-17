import { Button, TextField } from "@mui/material";
import Head from "next/head";
import React, { Fragment, useContext, useEffect, useState } from "react";
import useInput from "../hooks/use-input";
import styles from "../styles/auth.module.css";
import { useRouter } from "next/router";
import { createProfile, hasProfile } from "../utilities/app-utilities";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { GetServerSidePropsContext } from "next";
import { Database } from "../database.types";
import { NotificationContext } from "../context/notifications/NotificationContext";
import { PostgrestError } from "@supabase/supabase-js";

interface PageProps {
  userData: {
    profile_id: string;
    email: string;
    display_name: string;
    avatar_url?: string;
  };
}

const AuthComplete = ({ userData }: PageProps) => {
  const supabase = useSupabaseClient<Database>();
  const router = useRouter();
  const { showNotification } = useContext(NotificationContext);
  const accountNameInput = useInput(validateAccountName, {
    customTransformation: accountNameTransformation,
    defaultValue: generateAccountNameFromEmail(userData.email),
  });
  const displayNameInput = useInput(validateDisplayName, {
    defaultValue: userData.display_name,
  });
  const [createProfileBtnDisabled, setCreateProfileBtnDisabled] = useState(
    !accountNameInput.isValid || !displayNameInput.isValid,
  );
  const [cancelAuthBtnDisabled, setCancelAuthBtnDisabled] = useState(false);

  useEffect(() => {
    setCreateProfileBtnDisabled(
      !accountNameInput.isValid || !displayNameInput.isValid,
    );
  }, [accountNameInput.isValid, displayNameInput.isValid]);

  async function validateAccountName(value: string) {
    if (value.trim().length >= 3) {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { head: true, count: "exact" })
        .eq("account_name", value.trim());
      if (error) return false;
      return count === 0;
    }
    return false;
  }

  async function validateDisplayName(value: string) {
    return value.trim().length > 0;
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

    if (!accountNameInput.isValid || accountNameInput.hasError) {
      return showNotification("FAILED TO CREATE PROFILE", {
        severity: "error",
        error: new Error("Account name is invalid"),
      });
    } else if (!displayNameInput.isValid || displayNameInput.hasError) {
      return showNotification("FAILED TO CREATE PROFILE", {
        severity: "error",
        error: new Error("Display name is invalid"),
      });
    }

    try {
      disableButtons();
      const profileExists = await hasProfile(supabase, userData.profile_id);
      if (profileExists) {
        return showNotification("You have an existing profile already");
      }

      await createProfile(supabase, {
        id: userData.profile_id,
        account_name: accountNameInput.value,
        display_name: displayNameInput.value,
        email: userData.email,
        avatar_url: userData.avatar_url,
      });

      await router.push(`/users/${accountNameInput.value}`);
      router.reload();
    } catch (error) {
      showNotification("FAILED TO CREATE PROFILE", {
        severity: "error",
        error: error as PostgrestError,
      });
      enableButtons();
    }
  }

  async function cancelAuthentication() {
    disableButtons();
    const { error } = await supabase.auth.signOut();
    if (error === null) {
      router.reload();
    } else {
      showNotification("An error occurred while signing out", {
        severity: "error",
        error: error,
      });
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
          onSubmit={formSubmitHandler}
        >
          <TextField
            className={styles["text-field"]}
            variant="filled"
            label="Account Name"
            type="text"
            value={accountNameInput.value}
            onChange={accountNameInput.changeHandler}
            spellCheck={false}
            inputProps={{ minLength: 3 }}
            required
          />
          <TextField
            className={styles["text-field"]}
            variant="filled"
            label="Display Name"
            type="text"
            value={displayNameInput.value}
            onChange={displayNameInput.changeHandler}
            spellCheck={false}
            inputProps={{ minLength: 3 }}
            required
          />
          {accountNameInput.hasError && (
            <span className="form-helper-text">Account Name is Taken!</span>
          )}
          {displayNameInput.hasError && (
            <span className="form-helper-text">Display name is not valid</span>
          )}
          <Button
            variant="contained"
            type="submit"
            disabled={createProfileBtnDisabled}
          >
            Create Profile
          </Button>
          <Button
            variant="contained"
            color="error"
            type="button"
            disabled={cancelAuthBtnDisabled}
            onClick={cancelAuthentication}
          >
            Cancel Authentication
          </Button>
        </form>
      </main>
    </Fragment>
  );
};

export default AuthComplete;

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const supabaseClient = createServerSupabaseClient<Database>(context);
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session)
    return {
      redirect: {
        destination: "/search",
        permanent: false,
      },
    };
  const profileExists = await hasProfile(supabaseClient, session.user.id);
  if (!profileExists) {
    const userData = {
      profile_id: session.user.id,
      email: session.user.email,
      display_name: session.user.user_metadata?.full_name ?? "Default User",
      avatar_url: undefined,
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
        destination: "/search",
        permanent: false,
      },
    };
  }
};

function accountNameTransformation(text: string) {
  return text.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function generateAccountNameFromEmail(email: string) {
  const emailSubstrings = email.split("@");
  if (emailSubstrings.length > 0) {
    const emailName = emailSubstrings.at(0);
    return `${emailName}${Date.now()}`;
  } else {
    return `${email}${Date.now()}`;
  }
}
