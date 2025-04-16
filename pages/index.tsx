import { Fragment, ReactElement } from "react";
import AnimeItem from "../components/Items/AnimeItem/AnimeItem";
import BodyLayout from "../components/BodyLayout/BodyLayout";
import { getRelevantAnimeData } from "../utilities/app-utilities";
import Section from "../components/Section/Section";
import { getAnimes, getRandomAnimes } from "../utilities/mal-api";
import styles from "../styles/home.module.css";
import Head from "next/head";
import HeaderLayout from "../components/HeaderLayout/HeaderLayout";
import { Anime } from "@tutkli/jikan-ts";

const DEFAULT_N_LOADED_ITEMS = 10;

interface HomeProps {
  animes: {
    randomAnimes: Anime[];
    airingAnimes: Anime[];
    upcomingAnimes: Anime[];
    popularAnimes: Anime[];
  };
}

const Home = (props: HomeProps) => {
  const randomAnimes = (() => {
    const animes = props.animes.randomAnimes;
    const transformedData = animes.map((anime) => getRelevantAnimeData(anime));
    return transformedData.map((animeData) => (
      <AnimeItem key={animeData.id} data={animeData} />
    ));
  })();
  const airingAnimes = (() => {
    const animes = props.animes.airingAnimes;
    const transformedData = animes.map((anime) => getRelevantAnimeData(anime));
    return transformedData.map((animeData) => (
      <AnimeItem key={animeData.id} data={animeData} />
    ));
  })();
  const upcomingAnimes = (() => {
    const animes = props.animes.upcomingAnimes;
    const transformedData = animes.map((anime) => getRelevantAnimeData(anime));
    return transformedData.map((animeData) => (
      <AnimeItem key={animeData.id} data={animeData} />
    ));
  })();
  const popularAnimes = (() => {
    const animes = props.animes.popularAnimes;
    const transformedData = animes.map((anime) => getRelevantAnimeData(anime));
    return transformedData.map((animeData) => (
      <AnimeItem key={animeData.id} data={animeData} />
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
  const randomAnimes = await getRandomAnimes(DEFAULT_N_LOADED_ITEMS);
  const airingAnimes = await getAnimes("airing", DEFAULT_N_LOADED_ITEMS + 5);
  const upcomingAnimes = await getAnimes(
    "upcoming",
    DEFAULT_N_LOADED_ITEMS + 5,
  );
  const popularAnimes = await getAnimes(
    "bypopularity",
    DEFAULT_N_LOADED_ITEMS + 5,
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

Home.getLayout = (page: ReactElement) => {
  return (
    <HeaderLayout>
      <BodyLayout className={styles["home-main"]}>{page}</BodyLayout>
    </HeaderLayout>
  );
};
