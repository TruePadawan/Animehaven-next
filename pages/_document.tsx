import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta charSet="utf-8" />
				<link rel="icon" href="/favicon.ico" />
				<meta name="theme-color" content="#2B2B2B" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Baloo+Tamma+2:wght@400;500&family=Josefin+Sans&family=Lato:wght@400;700&family=Radio+Canada:wght@400;500&family=Roboto:wght@300;400;500;700&family=Rubik:wght@400;500&family=Ubuntu:wght@400;500&display=swap"
					rel="stylesheet"
				/>
				<meta property="og:type" content="website" />
				<meta property="og:image" content="https://i.imgur.com/uZuPhO7.jpg" />
				<meta property="og:image:alt" content="Animehaven home page" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:image" content="https://i.imgur.com/uZuPhO7.jpg" />
				<meta name="twitter:image:alt" content="Animehaven home page" />
				<meta name="twitter:site" content="@thetruepadawan" />
				<meta name="twitter:creator" content="@thetruepadawan" />
				<link rel="apple-touch-icon" href="/logo.png" />
				<link
					href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css"
					rel="stylesheet"
					integrity="sha384-Zenh87qX5JnK2Jl0vWa8Ck2rdkQ2Bzep5IDxbcnCeuOxjzrPF/et3URy9Bv1WTRi"
					crossOrigin="anonymous"
				/>
				<script
					src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.bundle.min.js"
					integrity="sha384-OERcA2EqjJCMA+/3y+gxIOqMEjwtxJY7qPCqsdltbNJuaOe923+mo//f6V8Qbsw3"
					crossOrigin="anonymous"></script>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
