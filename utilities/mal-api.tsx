import {Anime} from "@tutkli/jikan-ts";
import {ALLOWED_ANIME_TYPES, FLAGGED_ANIME_GENRES} from "./global-constants";

const isNSFW = (anime: Anime) => {
    return anime.genres.some((genre) => {
        return FLAGGED_ANIME_GENRES.includes(genre.name);
    });
};

const isFlagged = (anime: Anime) => {
    const hasNoImage = anime.images.jpg["image_url"] === "https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png";
    const hasNoDescription = anime.synopsis === null;
    const hasWrongType = anime.type !== null && !ALLOWED_ANIME_TYPES.includes(anime.type.toUpperCase());
    const notSFW = isNSFW(anime);

    return hasNoImage || hasWrongType || hasNoDescription || notSFW;
};

export const getRandomAnime = async (): Promise<Anime> => {
    const URL = "https://api.jikan.moe/v4/random/anime";
    let response = await fetch(URL);
    let anime = await (await response.json()).data;
    while (isFlagged(anime)) {
        response = await fetch(URL);
        anime = await (await response.json()).data;
    }
    return anime;
};

export const getAnimes = async (subCategory: string, limit = 20): Promise<Anime[]> => {
    const URL = `https://api.jikan.moe/v4/top/anime?filter=${subCategory}&limit=${limit}`;
    const response = await fetch(URL);
    return await (await response.json()).data;
};

export const getRandomAnimes = async (number = 1): Promise<Anime[]> => {
    const animes: Anime[] = [];
    // IF THE ITEM GOTTEN FROM API HAS BEEN GOTTEN BEFORE, REQUEST ANOTHER ONE
    while (animes.length !== number) {
        const anime = await getRandomAnime();
        if (!animes.some((randomAnime) => randomAnime.mal_id === anime.mal_id)) {
            animes.push(anime)
        }
    }
    return animes;
};

export const searchAnime = async (title: string, limit = 20) => {
    if (!title) throw new Error("Invalid Params");
    const URL = `https://api.jikan.moe/v4/anime?q=${title}&limit=${limit}&sfw=true`;
    const response = await fetch(URL);
    const list: Anime[] = await (await response.json()).data;
    return list.filter((anime) => !isFlagged(anime));
};

export const getAnimeById = async (id: string): Promise<Anime> => {
    const URL = `https://api.jikan.moe/v4/anime/${id}`;
    const response = await fetch(URL);

    if (response.status === 404) {
        throw new Error(`Anime with ID ${id} not found!`);
    }
    // IF API REQUEST LIMIT HITS, KEEP RECURSIVELY SENDING UNTIL IT PROCEEDS
    if (response.status === 429) {
        return await getAnimeById(id);
    } else if (response.status !== 200) {
        throw new Error(response.statusText);
    }

    const data = await (await response.json()).data;
    if (data === undefined) {
        throw new Error("Failed to find resource!");
    }
    return data;
};
