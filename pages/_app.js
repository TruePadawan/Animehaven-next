import { UserAuthContextProvider } from "../context/UserAuthContext";
import { Analytics } from "@vercel/analytics/react";
import "../styles/global.css";
import { Fragment } from "react";
import Head from "next/head";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

function MyApp({ Component, pageProps }) {
	const [supabaseClient] = useState(() => createBrowserSupabaseClient());
	const getLayout = Component.getLayout || ((page) => page);
	return (
		<Fragment>
			<Head>
				<title>Animehaven</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>
			<SessionContextProvider
				supabaseClient={supabaseClient}
				initialSession={pageProps.initialSession}>
				<UserAuthContextProvider>
					{getLayout(<Component {...pageProps} />)}
					<Analytics />
				</UserAuthContextProvider>
			</SessionContextProvider>
		</Fragment>
	);
}

export default MyApp;
