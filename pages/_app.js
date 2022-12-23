import Header from "../components/Header/Header";
import { UserAuthContextProvider } from "../context/UserAuthContext";
import { Analytics } from "@vercel/analytics/react";
import "../styles/global.css";
import { Fragment } from "react";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
	const getLayout = Component.getLayout || ((page) => page);
	return (
		<Fragment>
			<Head>
				<title>Animehaven</title>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>
			<UserAuthContextProvider>
				<Header />
				{getLayout(<Component {...pageProps} />)}
				<Analytics />
			</UserAuthContextProvider>
		</Fragment>
	);
}

export default MyApp;
