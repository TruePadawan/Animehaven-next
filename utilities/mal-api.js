const isNSFW = (item) => {
	const FLAGGED_GENRES = ["Hentai", "Boys Love", "Erotica", "Girls Love"];
	return item.genres.some((genre) => {
		return FLAGGED_GENRES.includes(genre.name);
	});
};

const isFlagged = (item) => {
	const acceptedTypes = ["TV", "OVA"];
	const hasNoImage =
		item.images.jpg["image_url"] ===
		"https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png";
	const hasNoDescription = item.synopsis === null;
	const hasWrongType =
		item.type !== null &&
		acceptedTypes.includes(item.type.toUpperCase()) === false;
	const notSFW = isNSFW(item);

	return hasNoImage || hasWrongType || hasNoDescription || notSFW;
};

export const getRandomAnime = async () => {
	const URL = "https://api.jikan.moe/v4/random/anime";
	let response = await fetch(URL);
	let anime = await (await response.json()).data;
	while (isFlagged(anime)) {
		response = await fetch(URL);
		anime = await (await response.json()).data;
	}
	return anime;
};

export const getListOfAnimes = async (subcategory, limit = 20) => {
	const URL = `https://api.jikan.moe/v4/top/anime?filter=${subcategory}&limit=${limit}`;
	const response = await fetch(URL);
	const list = await (await response.json()).data;
	return list;
};

export const requestNRandomAnime = async (number = 1, callback = null) => {
	const itemsData = [];
	// IF THE ITEM GOTTEN FROM API HAS BEEN GOTTEN BEFORE, REQUEST ANOTHER ONE
	for (let i = 0; i < number; ++i) {
		let animeData;
		do {
			animeData = await getRandomAnime();
		} while (
			itemsData.some((itemData) => animeData["mal_id"] === itemData["mal_id"])
		);
		itemsData.push(animeData);
		if (callback) {
			callback(animeData, i);
		}
	}
	return itemsData;
};

export const searchAnime = async (title, limit = 20) => {
	const allowedTypes = ["TV", "OVA", "Movie"];
	if (!title) throw new Error("Invalid Params");
	const URL = `https://api.jikan.moe/v4/anime?q=${title}&limit=${limit}&sfw=true`;
	const response = await fetch(URL);
	const list = await (await response.json()).data;
	const filteredList = [];
	list.forEach((anime) => {
		if (
			anime["type"] === "Music" ||
			anime.images.jpg["large_image_url"] ===
				"https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png" ||
			isNSFW(anime) ||
			!allowedTypes.includes(anime.type)
		) {
			return;
		}
		filteredList.push(anime);
	});
	return filteredList;
};

export const getAnimeByID = async (id) => {
	const URL = `https://api.jikan.moe/v4/anime/${id}`;
	const response = await fetch(URL);
  
	if (response.status === 404) {
		throw new Error(`Anime with ID ${id} not found!`);
	}
	// IF API REQUEST LIMIT HITS, KEEP RECURSIVELY SENDING UNTIL IT PROCEEDS
	if (response.status === 429) {
		return await getAnimeByID(id);
	} else if (response.status !== 200) {
		throw new Error(response.statusText);
	}

	const data = await (await response.json()).data;
	if (data === undefined) {
		throw new Error("Failed to find resource!");
	}
	return data;
};
