import Head from "next/head";
import PageContainer from "../../components/PageContainer/PageContainer";
import styles from "../../styles/discussions.module.css";

export default function Discussions() {
	return (
		<PageContainer className={styles["discussions-main"]}>
			<Head>
				<title>Animehaven | Discussions</title>
			</Head>
			<div className="d-flex justify-content-center align-items-center h-100">
				<h2>COMING SOON</h2>
			</div>
		</PageContainer>
	);
}
