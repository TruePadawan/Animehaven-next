import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta charSet="utf-8" />
				<link rel="icon" href="/favicon.ico" />
				<meta name="theme-color" content="#2B2B2B" />
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
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="true"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Josefin+Sans&family=Lato:wght@400;700&family=Radio+Canada:wght@400;500&family=Roboto:wght@300;400;500;700&family=Rubik:wght@400;500&family=Ubuntu:wght@400;500&display=swap"
					rel="stylesheet"
				/>
				<meta
					name="google-site-verification"
					content="MbWwC0AH37Bl4t4o11N6R-L1mhx8SblAYiIzU8AGT0U"
				/>
				<meta property="og:type" content="website" />
				<meta property="og:url" content="https://animehaven.vercel.app/" />
				<meta property="og:image" content="/animehaven.JPG" />
				<meta property="og:image:alt" content="Animehaven home page" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:image" content="/animehaven.JPG" />
				<meta name="twitter:image:alt" content="Animehaven front page" />
				<meta name="twitter:site" content="@thetruepadawan" />
				<meta name="twitter:creator" content="@thetruepadawan" />
				<link rel="apple-touch-icon" href="/logo.png" />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
