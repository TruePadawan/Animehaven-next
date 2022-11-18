import { Fragment } from "react";
import Header from "../components/Header/Header";
import "../styles/global.css";

function MyApp({ Component, pageProps }) {
	return (
		<Fragment>
			<Header />
			<Component {...pageProps} />
		</Fragment>
	);
}

export default MyApp;
