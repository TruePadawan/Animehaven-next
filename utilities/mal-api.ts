import {
  Anime,
  AnimeClient,
  AnimeSearchParams,
  RandomClient,
} from "@tutkli/jikan-ts";
import { ALLOWED_ANIME_TYPES, FLAGGED_ANIME_GENRES } from "./global-constants";

const isNSFW = (anime: Anime) => {
  return anime.genres.some((genre) => {
    return FLAGGED_ANIME_GENRES.includes(genre.name);
  });
};

const isFlagged = (anime: Anime) => {
  const hasNoImage =
    anime.images.jpg["image_url"] ===
    "https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png";
  const hasNoDescription = anime.synopsis === null;
  const hasWrongType =
    anime.type !== null &&
    !ALLOWED_ANIME_TYPES.includes(anime.type.toUpperCase());
  const notSFW = isNSFW(anime);

  return hasNoImage || hasWrongType || hasNoDescription || notSFW;
};

export const getRandomAnime = async (): Promise<Anime> => {
  const randomClient = new RandomClient();
  let { data: anime } = await randomClient.getRandomAnime();
  while (isFlagged(anime)) {
    const response = await randomClient.getRandomAnime();
    anime = response.data;
  }
  return anime;
};

export const getRandomAnimes = async (number = 1): Promise<Anime[]> => {
  const animes: Anime[] = [];
  // IF THE ITEM GOTTEN FROM API HAS BEEN GOTTEN BEFORE, REQUEST ANOTHER ONE
  while (animes.length !== number) {
    const anime = await getRandomAnime();
    if (!animes.some((randomAnime) => randomAnime.mal_id === anime.mal_id)) {
      animes.push(anime);
    }
  }
  return animes;
};

export const getAnimes = async (
  searchParams: AnimeSearchParams,
): Promise<Anime[]> => {
  const animeClient = new AnimeClient();
  const response = await animeClient.getAnimeSearch(searchParams);
  const animes = response.data;
  const uniqueAnimes: Anime[] = [];
  animes.forEach((anime) => {
    if (
      !uniqueAnimes.some((uniqueAnime) => uniqueAnime.mal_id === anime.mal_id)
    ) {
      uniqueAnimes.push(anime);
    }
  });
  return uniqueAnimes;
};

export const searchAnime = async (title: string, limit = 20) => {
  const animeClient = new AnimeClient();
  const response = await animeClient.getAnimeSearch({
    q: title,
    order_by: "popularity",
    limit,
  });
  return response.data.filter((anime) => !isFlagged(anime));
};

export const getAnimeById = async (id: number): Promise<Anime> => {
  const animeClient = new AnimeClient();
  const response = await animeClient.getAnimeById(id);

  // const URL = `https://api.jikan.moe/v4/anime/${id}`;
  // const response = await fetch(URL);

  // if (response.status === 404) {
  //   throw new Error(`Anime with ID ${id} not found!`);
  // }
  // // IF API REQUEST LIMIT HITS, KEEP RECURSIVELY SENDING UNTIL IT PROCEEDS
  // if (response.status === 429) {
  //   return await getAnimeById(id);
  // } else if (response.status !== 200) {
  //   throw new Error(response.statusText);
  // }
  //
  // const data = await (await response.json()).data;
  // if (data === undefined) {
  //   throw new Error("Failed to find resource!");
  // }
  // return data;
  return response.data;
};
