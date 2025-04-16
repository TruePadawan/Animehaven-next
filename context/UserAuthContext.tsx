import { useState, createContext, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Session,
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react";
import { hasProfile } from "../utilities/app-utilities";
import { UserAuthContextProviderProps, UserAuthContextType } from "./types";
import { Database } from "../database.types";
import { PostgrestError } from "@supabase/supabase-js";
import { getRedirectUrl } from "./utilities";

export const UserAuthContext = createContext<UserAuthContextType>({
  handleGoogleAuth: () => Promise.resolve(),
});

// TODO: UserAuthContext and its related code should be moved under an auth folder
export const UserAuthContextProvider = (
  props: UserAuthContextProviderProps,
) => {
  const [profileID, setProfileID] = useState<string>();
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && !profileID) {
      loadUser(user);
    }
  }, [user, profileID]);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      const hasSession = event === "SIGNED_IN" && session !== null;
      if (hasSession && profileID === undefined) {
        loadUser(session.user);
      } else if (event === "SIGNED_OUT") {
        setProfileID(undefined);
      }
    });
  }, []);

  async function loadUser(user: Session["user"]) {
    const userID = user.id;
    try {
      const profileExists = await hasProfile(supabase, userID);
      if (profileExists) {
        setProfileID(userID);
      } else {
        await router.replace(`/authcomplete`);
      }
    } catch (error) {
      const postgrestError = error as PostgrestError;
      alert(`Authentication failed! - ${postgrestError.message}`);
    }
  }

  async function handleGoogleAuth() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: getRedirectUrl() },
    });
    if (error !== null) {
      throw error;
    }
  }

  // Rename handleGoogleAuth to something more appropriate and it might not have to be passed through context
  return (
    <UserAuthContext.Provider value={{ profileID, handleGoogleAuth }}>
      {props.children}
    </UserAuthContext.Provider>
  );
};
