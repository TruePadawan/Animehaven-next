import { filetypemime } from "magic-bytes.js";

export const PROFILE_IMG_MAX_SIZE = Math.pow(10, 6);
export const defaultSnackbarState = { open: false, severity: "info", text: "" };
export const LIST_GENRES = [
	"Action",
	"Adventure",
	"Comedy",
	"Drama",
	"Ecchi",
	"Horror",
	"Sports",
	"Supernatural",
	"Romance",
	"Suspense",
	"Fantasy",
	"Slice of Life",
	"Sci-Fi",
	"Boys Love",
];
export const DISCUSSION_TAGS = ["Chat", "Support"];

export function getUsefulData(rawAnimeData) {
	const id = rawAnimeData["mal_id"];
	let title = rawAnimeData.title;
	rawAnimeData.titles.forEach((lang) => {
		if (lang["type"] === "English") {
			title = lang["title"];
		}
	});
	let imageURL = rawAnimeData.images.webp["image_url"];
	const type = rawAnimeData.type;
	const score = rawAnimeData.score;
	const genres = rawAnimeData.genres;
	const overview = rawAnimeData["synopsis"];

	return { id, title, imageURL, type, score, genres, overview };
}

export function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createProfile(supabase, accountData) {
	return supabase.from("profiles").insert(accountData);
}

export async function hasProfile(supabase, profileID) {
	const { count } = await supabase
		.from("profiles")
		.select("*", { count: "exact", head: true })
		.eq("id", profileID)
		.throwOnError();
	return count === 1;
}

export const DEFAULT_AVATAR_URL =
	"https://bkpyhkkjvgzfjojacrka.supabase.co/storage/v1/object/public/avatars/noprofilepic.jpg";

export async function getCommentsData(
	supabase,
	instanceID,
	limit,
	startAfterIndex = null
) {
	let response;
	if (startAfterIndex === null) {
		response = await supabase
			.from("comments")
			.select("*", { count: "exact" })
			.eq("instance_id", instanceID)
			.limit(limit)
			.order("created_at", { ascending: false })
			.throwOnError();
	} else {
		response = await supabase
			.from("comments")
			.select("*", { count: "exact" })
			.eq("instance_id", instanceID)
			.lt("index", startAfterIndex)
			.limit(limit)
			.order("created_at", { ascending: false })
			.throwOnError();
	}
	return response;
}

export async function getCommentData(supabase, commentID, fields = "*") {
	const { data } = await supabase
		.from("comments")
		.select(fields)
		.eq("id", commentID)
		.throwOnError()
		.limit(1)
		.single();
	return data;
}

export async function getProfileData(supabase, fields, profileID) {
	const { data } = await supabase
		.from("profiles")
		.select(fields)
		.eq("id", profileID)
		.throwOnError()
		.limit(1)
		.single();
	return data;
}

export async function getProfileID(supabase, accountName) {
	const { data } = await supabase
		.from("profiles")
		.select("id")
		.eq("account_name", accountName)
		.throwOnError();
	if (data.length === 1) {
		return data[0].id;
	}
	return null;
}

export async function getReviewUpvoteList(supabase, reviewID) {
	const { data } = await supabase
		.from("item_reviews")
		.select("upvoted_by")
		.eq("id", reviewID)
		.limit(1)
		.single();
	return data.upvoted_by;
}

export async function reviewExist(supabase, reviewID) {
	const { count } = await supabase
		.from("item_reviews")
		.select("*", { count: "exact", head: true })
		.eq("id", reviewID);
	return count === 1;
}

export async function toggleUpvoteForReview(supabase, reviewID, profileID) {
	if (!profileID) {
		throw new Error("NO_PROFILE_ID_SPECIFIED");
	}
	// CONFIRM THAT REVIEW EXISTS
	try {
		const exist = await reviewExist(supabase, reviewID);
		if (!exist) {
			return {
				status: "FAILED",
				code: "REVIEW_NOT_FOUND",
			};
		}
	} catch (error) {
		throw new Error("REVIEW_EXISTENCE_NOT_CONFIRMED");
	}

	const { data, error } = await supabase.rpc("toggle_review_upvote", {
		profile_id: profileID,
		review_id: reviewID,
	});

	if (error) throw error;
	return {
		status: "COMPLETE",
		code: data,
	};
}

export async function deleteReview(supabase, reviewID, profileID) {
	if (!profileID) {
		throw new Error("NO_PROFILE_ID_SPECIFIED");
	}
	// CONFIRM THAT REVIEW EXISTS
	try {
		const exist = await reviewExist(supabase, reviewID);
		if (!exist) {
			return {
				status: "FAILED",
				code: "REVIEW_NOT_FOUND",
			};
		}
	} catch (error) {
		throw new Error("REVIEW_EXISTENCE_NOT_CONFIRMED");
	}

	await supabase
		.from("item_reviews")
		.delete()
		.eq("id", reviewID)
		.eq("creator_id", profileID)
		.throwOnError();
	return {
		status: "COMPLETE",
		code: "REVIEW_DELETED",
	};
}

export async function toggleUpvoteForComment(supabase, commentID, profileID) {
	if (!profileID) {
		throw new Error("NO_PROFILE_ID_SPECIFIED");
	}

	const { data, error } = await supabase.rpc("toggle_comment_upvote", {
		comment_id: commentID,
		profile_id: profileID,
	});

	if (error) throw error;
	return {
		status: "COMPLETE",
		code: data,
	};
}

export async function getUserItemRecommendations(supabase, profileID) {
	const response = await supabase
		.from("item_recommendations")
		.select()
		.eq("recommended_by", profileID)
		.throwOnError();
	return response;
}

export async function getUserItemReviews(supabase, profileID) {
	const response = await supabase
		.from("item_reviews")
		.select()
		.eq("creator_id", profileID)
		.throwOnError();
	return response;
}

export async function getDiscussionsByTags(supabase, tags, profileID = null) {
	if (!(tags instanceof Array)) {
		throw new Error("Invalid params - tags must be an array");
	}
	if (profileID === null) {
		const { data } = await supabase
			.from("discussions")
			.select()
			.in("tag", tags)
			.throwOnError();
		return data;
	} else {
		const { data } = await supabase
			.from("discussions")
			.select()
			.in("tag", tags)
			.eq("creator_id", profileID)
			.throwOnError();
		return data;
	}
}

export async function getDiscussionByID(supabase, discussionID) {
	if (!discussionID) {
		throw new Error(`Invalid argument passed - ${discussionID}`);
	}
	const { data } = await supabase
		.from("discussions")
		.select("*")
		.eq("id", discussionID)
		.throwOnError();
	if (data.length === 0) {
		throw new Error(`Discussion with id - ${discussionID} not found!`);
	}
	return data[0];
}

export async function getDiscussionByAccountName(supabase, accountName) {
	if (!accountName) {
		throw new Error(`Invalid argument passed - ${accountName}`);
	}
	const id = await getProfileID(supabase, accountName);
	const { data } = await supabase
		.from("discussions")
		.select("*")
		.eq("creator_id", id)
		.throwOnError();
	return data;
}

export async function getListByID(supabase, listID) {
	if (!listID) {
		throw new Error(`Invalid argument passed - ${listID}`);
	}
	const { data } = await supabase
		.from("anime_lists")
		.select("*")
		.eq("id", listID)
		.throwOnError();
	if (data.length === 0) {
		throw new Error(
			"List data could not be retrieved. It might be private or deleted!"
		);
	}
	return data[0];
}

export function numberToString(count, appendString) {
	if (count === 0) {
		return `0 ${appendString}s`;
	} else if (count === 1) {
		return `1 ${appendString}`;
	}

	const nCommentsString = `${count}`;
	const approxString = nCommentsString.slice(0, nCommentsString.length - 3);
	if (count <= 1000) {
		return `${count} ${appendString}s`;
	} else {
		return `${approxString}k+ ${appendString}s`;
	}
}

export async function getReviewByUser(supabase, animeID, profileID) {
	const { data } = await supabase
		.from("item_reviews")
		.select()
		.eq("item_id", animeID)
		.eq("creator_id", profileID)
		.throwOnError();
	return data;
}

export async function getReviewsData(
	supabase,
	animeID,
	limit,
	startAfterIndex = null,
	profileID = null
) {
	let list = [];
	let totalReviewsCount = 0;
	const response = { data: [], count: 0 };
	// GET USER REVIEW FIRST BEFORE OTHER REVIEWS IF PROFILE ID SPECIFIED
	if (profileID !== null) {
		const userReview = await getReviewByUser(supabase, animeID, profileID);
		if (userReview.length > 0) {
			list.push(userReview[0]);
			totalReviewsCount += 1;
		}

		if (startAfterIndex !== null) {
			const { data, count } = await supabase
				.from("item_reviews")
				.select("*", { count: "exact" })
				.eq("item_id", animeID)
				.neq("creator_id", profileID)
				.limit(limit)
				.lt("index", startAfterIndex)
				.order("created_at", { ascending: false })
				.throwOnError();
			totalReviewsCount += count;
			list = list.concat(data);
		} else {
			const { data, count } = await supabase
				.from("item_reviews")
				.select("*", { count: "exact" })
				.eq("item_id", animeID)
				.neq("creator_id", profileID)
				.limit(limit)
				.order("created_at", { ascending: false })
				.throwOnError();
			totalReviewsCount += count;
			list = list.concat(data);
		}
	} else {
		if (startAfterIndex !== null) {
			const { data, count } = await supabase
				.from("item_reviews")
				.select("*", { count: "exact" })
				.eq("item_id", animeID)
				.limit(limit)
				.lt("index", startAfterIndex)
				.order("created_at", { ascending: false })
				.throwOnError();
			totalReviewsCount += count;
			list = list.concat(data);
		} else {
			const { data, count } = await supabase
				.from("item_reviews")
				.select("*", { count: "exact" })
				.eq("item_id", animeID)
				.limit(limit)
				.order("created_at", { ascending: false })
				.throwOnError();
			totalReviewsCount += count;
			list = list.concat(data);
		}
	}
	response.data = list;
	response.count = totalReviewsCount;
	return response;
}

export async function getRecentItems(supabase, type, profileID) {
	const { data } = await supabase
		.from("recent_items")
		.select(type)
		.eq("profile_id", profileID)
		.throwOnError();
	return data[0][type];
}

export async function setRecentItem(supabase, type, profileID, item) {
	const recentItems = await getRecentItems(supabase, type, profileID);
	let itemAlreadyExists = false;
	if (type === "animes") {
		itemAlreadyExists = recentItems.some((r_item) => r_item.id === item.id);
	} else {
		itemAlreadyExists = recentItems.includes(item);
	}
	if (!itemAlreadyExists) {
		let updatedRecentItems = [item, ...recentItems];
		if (updatedRecentItems.length > 3) {
			updatedRecentItems = updatedRecentItems.slice(0, 3);
		}
		try {
			await supabase
				.from("recent_items")
				.update({
					[type]: updatedRecentItems,
				})
				.eq("profile_id", profileID)
				.throwOnError();
		} catch (error) {
			throw new Error(`Failed to update recent items - ${type}`);
		}
	}
}

export function verifyProfileImage(file, onVerificationComplete) {
	let isValidSize = file.size <= PROFILE_IMG_MAX_SIZE;
	if (isValidSize) {
		// CONFIRM FILE IS AN IMAGE
		const fileReader = new FileReader();
		fileReader.addEventListener("loadend", (event) => {
			const bytes = new Uint8Array(event.target.result);
			const fileType = filetypemime(bytes);
			let isValid = false;
			if (fileType.length > 0) {
				isValid = fileType.at(0).split("/").at(0) === "image";
			}
			onVerificationComplete(isValid);
		});
		fileReader.readAsArrayBuffer(file);
	} else {
		onVerificationComplete(false);
	}
}
