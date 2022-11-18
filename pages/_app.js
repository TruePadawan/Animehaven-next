import Header from "../components/Header/Header";
import { UserAuthContextProvider } from "../context/UserAuthContext";
import { Analytics } from '@vercel/analytics/react';
import "../styles/global.css";

function MyApp({ Component, pageProps }) {
	return (
		<UserAuthContextProvider>
			<Header />
			<Component {...pageProps} />
			<Analytics />
		</UserAuthContextProvider>
	);
}

export default MyApp;
