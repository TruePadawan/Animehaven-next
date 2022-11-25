import { Fragment, useState } from "react";
import AnimeItem from "../components/Items/AnimeItem/AnimeItem";
import PageContainer from "../components/PageContainer/PageContainer";
import { getUsefulData } from "../utilities/app-utilities";
import Section from "../components/Section/Section";
import { getListOfAnimes, requestNRandomAnime } from "../utilities/mal-api";
import styles from "../styles/home.module.css";
import Head from "next/head";
import { Alert, Snackbar } from "@mui/material";
import { v4 as uuid } from "uuid";

const getNSkeletonItems = (number = 1) => {
	let items = [];
	for (let i = 0; i < number; ++i) {
		items.push(<AnimeItem skeleton key={uuid()} />);
	}
	return items;
};

const DEFAULT_N_LOADED_ITEMS = 10;
const ANIME_ITEMS_SKELETONS = getNSkeletonItems(DEFAULT_N_LOADED_ITEMS);
const default_error_state = { occurred: false, text: "" };
const Home = (props) => {
	const [error, setError] = useState(default_error_state);
	const [randomAnimes, setRandomAnimes] = useState(() => {
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
	});
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

	const handleError = (errorText) => {
		const text = `${errorText} - Reload the page!`;
		setError({ occurred: true, text });
	};

	const resetError = () => {
		setError(default_error_state);
	};

	const loadRandomAnimes = async () => {
		setRandomAnimes([...ANIME_ITEMS_SKELETONS]);
		try {
			await requestNRandomAnime(DEFAULT_N_LOADED_ITEMS, (anime, index) => {
				const animeData = getUsefulData(anime);
				setRandomAnimes((list) => {
					list[index] = (
						<AnimeItem
							key={animeData.id}
							id={animeData.id}
							title={animeData.title}
							image={animeData.imageURL}
							type={animeData.type}
							score={animeData.score}
							genres={animeData.genres}
						/>
					);
					return [...list];
				});
			});
		} catch (err) {
			handleError("Problem loading animes");
		}
	};

	return (
		<Fragment>
			<Head>
				<title>Animehaven</title>
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
			<PageContainer className={styles["home-main"]}>
				<Section title={"Random"} refreshable onBtnClick={loadRandomAnimes}>
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
				<Snackbar open={error.occurred} onClose={resetError}>
					<Alert onClose={resetError} severity="error" sx={{ width: "100%" }}>
						{error.text}
					</Alert>
				</Snackbar>
			</PageContainer>
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
