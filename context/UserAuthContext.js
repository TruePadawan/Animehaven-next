import { useState, createContext, useEffect } from "react";
import { supabase } from "../supabase/config";
import { v4 as uuid } from "uuid";
import { createProfile } from "../utilities/app-utilities";

export const UserAuthContext = createContext({
	profileID: null,
});

const handleGoogleAuth = async (e) => {
	const { error } = await supabase.auth.signInWithOAuth({
		provider: "google",
	});
	if (error !== null) {
		throw error;
	}
};

export const UserAuthContextProvider = ({ children }) => {
	const [profileID, setProfileID] = useState(null);

	useEffect(() => {
		supabase.auth.getSession().then(({ data }) => {
			if (data.session !== null) {
				loadSession(data.session);
			}
		});
	}, []);

	const loadSession = async (session) => {
		const uid = session.user.id;
		const email = session.user.email;
		const accountName = `${email
			.replace(/[^a-zA-Z0-9]/g, "")
			.toLowerCase()}${uuid()}`;

		try {
			const provider = session.user.app_metadata.provider;
			const { count, error } = await supabase
				.from("profiles")
				.select("*", { count: "exact", head: true })
				.eq("id", uid);
			if (error !== null) {
				throw error;
			}
			const accountExist = count === 1;
			// IF PROVIDER IS GOOGLE AND NO PROFILE EXISTS FOR AUTHENTICATED USER, CREATE A DEFAULT PROFILE.
			if (provider === "google") {
				if (accountExist === false) {
					await createProfile({
						id: uid,
						account_name: accountName,
						email,
					});
					setProfileID(uid);
				}
			} else {
				if (accountExist === true) {
					setProfileID(uid);
				}
			}
		} catch (error) {
			alert(`Authentication failed! - ${error.message}`);
		}
	};

	supabase.auth.onAuthStateChange((event, session) => {
		// ON SIGN IN, IF THERE IS NO ACCOUNT ASSOCIATED WITH SIGNED IN USER, CREATE ONE ELSE SIGN INTO IT
		if (event === "SIGNED_IN" && profileID === null) {
			loadSession(session);
		} else if (event === "SIGNED_OUT") {
			setProfileID(null);
		}
	});

	const value = { profileID, handleGoogleAuth };
	return (
		<UserAuthContext.Provider value={value}>
			{children}
		</UserAuthContext.Provider>
	);
};
