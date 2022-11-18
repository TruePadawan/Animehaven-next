import Head from "next/head";
import PageContainer from "../../components/PageContainer/PageContainer";
import styles from "../../styles/discussions.module.css";

export default function Discussions() {
	return (
		<PageContainer className={styles["discussions-main"]}>
			<Head>
				<title>Animehaven | Discussions</title>
				<meta property="og:url" content="https://animehaven.vercel.app/discussions" />
				<meta
					name="description"
					content="COMING SOON"
				/>
				<meta property="og:title" content="Animehaven | Discussions" />
				<meta
					property="og:description"
					content="COMING SOON"
				/>
				<meta name="twitter:title" content="Animehaven | Discussions" />
				<meta
					name="twitter:description"
					content="COMING SOON"
				/>
			</Head>
			<div className="d-flex justify-content-center align-items-center h-100">
				<h2>COMING SOON</h2>
			</div>
		</PageContainer>
	);
}
