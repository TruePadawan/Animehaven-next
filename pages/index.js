import { Fragment } from "react";
import AnimeItem from "../components/Items/AnimeItem/AnimeItem";
import PageContainer from "../components/PageContainer/PageContainer";
import { getUsefulData } from "../utilities/app-utilities";
import Section from "../components/Section/Section";
import { getListOfAnimes, requestNRandomAnime } from "../utilities/mal-api";
import styles from "../styles/home.module.css";
import Head from "next/head";

const DEFAULT_N_LOADED_ITEMS = 10;
const Home = (props) => {
	const randomAnimes = (() => {
		const animes = props.animes.randomAnimes;
		const transformedData = animes.map((anime) => getUsefulData(anime));
		return transformedData.map((animeData) => (
			<AnimeItem
				key={animeData.id}
				id={animeData.id}
				title={animeData.title}
				image={animeData.imageURL}
				type={animeData.type}
				score={animeData.score}
				genres={animeData.genres}
			/>
		));
	})();
	const airingAnimes = (() => {
		const animes = props.animes.airingAnimes;
		const transformedData = animes.map((anime) => getUsefulData(anime));
		return transformedData.map((animeData) => (
			<AnimeItem
				key={animeData.id}
				id={animeData.id}
				title={animeData.title}
				image={animeData.imageURL}
				type={animeData.type}
				score={animeData.score}
				genres={animeData.genres}
			/>
		));
	})();
	const upcomingAnimes = (() => {
		const animes = props.animes.upcomingAnimes;
		const transformedData = animes.map((anime) => getUsefulData(anime));
		return transformedData.map((animeData) => (
			<AnimeItem
				key={animeData.id}
				id={animeData.id}
				title={animeData.title}
				image={animeData.imageURL}
				type={animeData.type}
				score={animeData.score}
				genres={animeData.genres}
			/>
		));
	})();
	const popularAnimes = (() => {
		const animes = props.animes.popularAnimes;
		const transformedData = animes.map((anime) => getUsefulData(anime));
		return transformedData.map((animeData) => (
			<AnimeItem
				key={animeData.id}
				id={animeData.id}
				title={animeData.title}
				image={animeData.imageURL}
				type={animeData.type}
				score={animeData.score}
				genres={animeData.genres}
			/>
		));
	})();

	return (
		<Fragment>
			<Head>
				<title>Animehaven | Home</title>
				<meta
					name="description"
					content="Get information on the latest animes, compile and share lists of animes and have discussions about your favorite animes on Animehaven."
				/>
				<meta property="og:title" content="Animehaven" />
				<meta property="og:url" content="https://animehaven.vercel.app/" />
				<meta
					property="og:description"
					content="Get information on the latest animes, compile and share lists of animes and have discussions about your favorite animes on Animehaven."
				/>
				<meta property="og:type" content="website" />
				<meta name="twitter:title" content="Animehaven" />
				<meta
					name="twitter:description"
					content="Get information on the latest animes, compile and share lists of animes and have discussions about your favorite animes on Animehaven."
				/>
			</Head>
			<Section title={"Random"}>
				<ul className={styles["anime-list"]}>{randomAnimes}</ul>
			</Section>
			<Section title={"Airing"}>
				<ul className={styles["anime-list"]}>{airingAnimes}</ul>
			</Section>
			<Section title={"Upcoming"} className={styles["darker-section"]}>
				<ul className={styles["anime-list"]}>{upcomingAnimes}</ul>
			</Section>
			<Section title={"Popular"} className={styles["darker-section"]}>
				<ul className={styles["anime-list"]}>{popularAnimes}</ul>
			</Section>
		</Fragment>
	);
};

export async function getStaticProps() {
	const randomAnimes = await requestNRandomAnime(DEFAULT_N_LOADED_ITEMS);
	const airingAnimes = await getListOfAnimes(
		"airing",
		DEFAULT_N_LOADED_ITEMS + 5
	);
	const upcomingAnimes = await getListOfAnimes(
		"upcoming",
		DEFAULT_N_LOADED_ITEMS + 5
	);
	const popularAnimes = await getListOfAnimes(
		"bypopularity",
		DEFAULT_N_LOADED_ITEMS + 5
	);

	return {
		props: {
			animes: {
				randomAnimes,
				airingAnimes,
				upcomingAnimes,
				popularAnimes,
			},
		},
		revalidate: 600,
	};
}

export default Home;

Home.getLayout = (page) => (
	<PageContainer className={styles["home-main"]}>{page}</PageContainer>
);
