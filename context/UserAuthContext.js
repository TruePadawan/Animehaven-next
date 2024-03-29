import { useState, createContext, useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { hasProfile } from "../utilities/app-utilities";

export const UserAuthContext = createContext({
	profileID: null,
});

function getRedirectUrl() {
	const baseUrl =
		process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL;
	let url = baseUrl.includes("http") ? baseUrl : `https://${baseUrl}`;
	return url.charAt(url.length - 1) === "/" ? url : `${url}/`;
}

export const UserAuthContextProvider = ({ children }) => {
	const [profileID, setProfileID] = useState(null);
	const supabase = useSupabaseClient();
	const user = useUser();
	const router = useRouter();

	useEffect(() => {
		if (user && !profileID) {
			loadAuthSession({ user });
		}
	}, [user, profileID]);

	useEffect(() => {
		supabase.auth.onAuthStateChange((event, session) => {
			if (event === "SIGNED_IN" && profileID === null) {
				loadAuthSession(session);
			} else if (event === "SIGNED_OUT") {
				setProfileID(null);
			}
		});
	}, []);

	async function handleGoogleAuth() {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo: getRedirectUrl() },
		});
		if (error !== null) {
			throw error;
		}
	}

	async function loadAuthSession(session) {
		const userID = session.user.id;
		try {
			const profileExists = await hasProfile(supabase, userID);
			if (profileExists) {
				setProfileID(userID);
			} else {
				router.replace(`/authcomplete`);
			}
		} catch (error) {
			alert(`Authentication failed! - ${error.message}`);
		}
	}

	const value = { profileID, handleGoogleAuth };
	return (
		<UserAuthContext.Provider value={value}>
			{children}
		</UserAuthContext.Provider>
	);
};
