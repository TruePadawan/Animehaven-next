import Head from "next/head";
import Link from "next/link";

const NO_PAGE = () => {
	return (
		<div className="text-white d-flex justify-content-center align-items-center flex-column h-100">
			<Head>
				<title>Animehaven | Page not Found</title>
				<meta name="description" content="Page not Found!" />
				<meta property="og:title" content="Animehaven | Page not Found" />
				<meta property="og:url" content="https://animehaven.vercel.app/404" />
				<meta property="og:description" content="Page not Found!" />
				<meta name="twitter:title" content="Animehaven | Page not Found" />
				<meta name="twitter:description" content="Page not Found!" />
			</Head>
			<h1>PAGE NOT FOUND</h1>
			<Link className="fs-6 text-primary" href="/">GO HOME</Link>
		</div>
	);
};

export default NO_PAGE;
