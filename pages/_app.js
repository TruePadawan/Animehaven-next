import Header from "../components/Header/Header";
import { UserAuthContextProvider } from "../context/UserAuthContext";
import { Analytics } from "@vercel/analytics/react";
import "../styles/global.css";

function MyApp({ Component, pageProps }) {
	const getLayout = Component.getLayout || ((page) => page);
	return (
		<UserAuthContextProvider>
			<Header />
			{getLayout(<Component {...pageProps} />)}
			<Analytics />
		</UserAuthContextProvider>
	);
}

export default MyApp;
