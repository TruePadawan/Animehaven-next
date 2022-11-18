import Header from "../components/Header/Header";
import { UserAuthContextProvider } from "../context/UserAuthContext";
import "../styles/global.css";

function MyApp({ Component, pageProps }) {
	return (
		<UserAuthContextProvider>
			<Header />
			<Component {...pageProps} />
		</UserAuthContextProvider>
	);
}

export default MyApp;
