import {
  Anime,
  AnimeClient,
  AnimeSearchParams,
  RandomClient,
} from "@tutkli/jikan-ts";
import { ALLOWED_ANIME_TYPES, FLAGGED_ANIME_GENRES } from "./global-constants";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Global rate limiter for Jikan API.
 * Enforces: max 3 requests/second, max 60 requests/minute.
 */
const rateLimiter = (() => {
  const timestamps: number[] = [];
  const PER_SECOND = 3;
  const PER_MINUTE = 60;

  return async () => {
    const now = Date.now();
    // Remove timestamps older than 60s
    while (timestamps.length > 0 && now - timestamps[0] > 60_000) {
      timestamps.shift();
    }

    // If at per-minute limit, wait until the oldest request expires
    if (timestamps.length >= PER_MINUTE) {
      const waitTime = 60_000 - (now - timestamps[0]) + 100;
      console.log(`Per-minute rate limit reached, waiting ${waitTime}ms...`);
      await delay(waitTime);
    }

    // Check per-second limit (requests in last 1000ms)
    const oneSecondAgo = Date.now() - 1000;
    const recentRequests = timestamps.filter((t) => t > oneSecondAgo).length;
    if (recentRequests >= PER_SECOND) {
      const oldestRecent = timestamps.filter((t) => t > oneSecondAgo)[0];
      const waitTime = 1000 - (Date.now() - oldestRecent) + 100;
      await delay(waitTime);
    }

    timestamps.push(Date.now());
  };
})();

/**
 * Execute an API call with global rate limiting and retry on 429.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  baseDelay = 2000,
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    await rateLimiter();
    try {
      return await fn();
    } catch (error: any) {
      const status = error?.response?.status ?? error?.status;
      if (status === 429 && attempt < maxRetries) {
        const waitTime = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limited (429), retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})...`);
        await delay(waitTime);
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded");
}

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
  let { data: anime } = await withRetry(() => randomClient.getRandomAnime());
  while (isFlagged(anime)) {
    const response = await withRetry(() => randomClient.getRandomAnime());
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
  const response = await withRetry(() => animeClient.getAnimeSearch(searchParams));
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
  const response = await withRetry(() =>
    animeClient.getAnimeSearch({
      q: title,
      order_by: "popularity",
      limit,
    }),
  );
  return response.data.filter((anime) => !isFlagged(anime));
};

export const getAnimeById = async (id: number): Promise<Anime> => {
  const animeClient = new AnimeClient();
  const response = await withRetry(() => animeClient.getAnimeById(id));

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
