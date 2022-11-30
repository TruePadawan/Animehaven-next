import { supabase } from "../supabase/config";

export function getUsefulData(rawAnimeData) {
	const id = rawAnimeData["mal_id"];
	let title = rawAnimeData.title;
	rawAnimeData.titles.forEach((lang) => {
		if (lang["type"] === "English") {
			title = lang["title"];
		}
	});
	const imageURL = rawAnimeData.images.jpg["large_image_url"];
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

export function createProfile(accountData) {
	return supabase.from("profiles").insert(accountData);
}

export const DEFAULT_AVATAR_URL =
	"https://bkpyhkkjvgzfjojacrka.supabase.co/storage/v1/object/public/avatars/noprofilepic.jpg";

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

export async function getCommentsData(instanceID) {
	const { data } = await supabase
		.from("comments")
		.select()
		.eq("instance_id", instanceID)
		.limit(4)
		.order("created_at", { ascending: false })
		.throwOnError();
	return data;
}

export async function getCommentData(commentID, fields = "*") {
	const { data } = await supabase
		.from("comments")
		.select(fields)
		.eq("id", commentID)
		.throwOnError()
		.limit(1)
		.single();
	return data;
}

export async function getProfileData(fields, profileID) {
	const { data } = await supabase
		.from("profiles")
		.select(fields)
		.eq("id", profileID)
		.throwOnError()
		.limit(1)
		.single();
	return data;
}

export async function getProfiles() {
	const { data } = await supabase.from("profiles").select().throwOnError();
	return data;
}

export async function getProfileID(accountName) {
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

export async function getReviewUpvoteList(reviewID) {
	const { data } = await supabase
		.from("item_reviews")
		.select("upvoted_by")
		.eq("id", reviewID)
		.limit(1)
		.single();
	return data.upvoted_by;
}

export async function reviewExist(reviewID) {
	const { count } = await supabase
		.from("item_reviews")
		.select("*", { count: "exact", head: true })
		.eq("id", reviewID);
	return count === 1;
}

export async function toggleUpvoteForReview(reviewID, profileID) {
	if (!profileID) {
		throw new Error("NO_PROFILE_ID_SPECIFIED");
	}

	// CONFIRM THAT REVIEW EXISTS
	try {
		const exist = await reviewExist(reviewID);
		if (!exist) {
			return {
				status: "FAILED",
				code: "REVIEW_NOT_FOUND",
			};
		}
	} catch (error) {
		throw new Error("REVIEW_EXISTENCE_NOT_CONFIRMED");
	}

	const { data } = await supabase
		.from("item_reviews")
		.select("upvoted_by,creator_id")
		.eq("id", reviewID)
		.throwOnError()
		.limit(1)
		.single();
	const reviewCreatorID = data.creator_id;
	if (reviewCreatorID === profileID) {
		throw new Error("CANNOT UPVOTE OWN REVIEW");
	}
	let upvoteList = data.upvoted_by;
	if (upvoteList.includes(profileID)) {
		upvoteList = upvoteList.filter((id) => id !== profileID);
		await supabase
			.from("item_reviews")
			.update({ upvoted_by: upvoteList })
			.eq("id", reviewID)
			.throwOnError();
		return {
			status: "COMPLETE",
			code: "UPVOTE_REMOVED",
		};
	} else {
		upvoteList.push(profileID);
		await supabase
			.from("item_reviews")
			.update({ upvoted_by: upvoteList })
			.eq("id", reviewID);
		return {
			status: "COMPLETE",
			code: "UPVOTE_ADDED",
		};
	}
}

export async function deleteReview(reviewID, profileID) {
	if (!profileID) {
		throw new Error("NO_PROFILE_ID_SPECIFIED");
	}

	// CONFIRM THAT REVIEW EXISTS
	try {
		const exist = await reviewExist(reviewID);
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

export async function toggleUpvoteForComment(commentID, profileID) {
	if (!profileID) {
		throw new Error("NO_PROFILE_ID_SPECIFIED");
	}

	let upvoteList = [];
	try {
		const { upvoted_by } = await getCommentData(commentID, "upvoted_by");
		upvoteList = upvoted_by;
	} catch (error) {
		throw error;
	}
	if (upvoteList.includes(profileID)) {
		upvoteList = upvoteList.filter((id) => id !== profileID);
		await supabase
			.from("comments")
			.update({ upvoted_by: upvoteList })
			.eq("id", commentID)
			.select("upvoted_by")
			.throwOnError();
		return {
			status: "COMPLETE",
			code: "UPVOTE REMOVED",
		};
	} else {
		upvoteList = upvoteList.concat(profileID);
		await supabase
			.from("comments")
			.update({ upvoted_by: upvoteList })
			.eq("id", commentID)
			.select("upvoted_by")
			.throwOnError();
		return {
			status: "COMPLETE",
			code: "UPVOTE ADDED",
		};
	}
}

export async function getUserItemRecommendations(profileID) {
	const response = await supabase
		.from("item_recommendations")
		.select()
		.eq("recommended_by", profileID)
		.throwOnError();
	return response;
}

export async function getUserItemReviews(profileID) {
	const response = await supabase
		.from("item_reviews")
		.select()
		.eq("creator_id", profileID)
		.throwOnError();
	return response;
}

export async function getDiscussionsByTags(tags, profileID = null) {
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

export async function getDiscussionByID(discussionID) {
	if (!discussionID) {
		throw new Error(`Invalid argument passed - ${discussionID}`);
	}
	const { data } = await supabase
		.from("discussions")
		.select("*", { count: "exact" })
		.eq("id", discussionID)
		.throwOnError()
		.limit(1)
		.single();
	return data;
}

export async function getListByID(listID) {
	if (!listID) {
		throw new Error(`Invalid argument passed - ${listID}`);
	}
	const { data, count } = await supabase
		.from("anime_lists")
		.select("*", { count: "exact" })
		.eq("id", listID)
		.throwOnError();
	if (count === 0) {
		throw new Error(
			"List data could not be retrieved. It might be private or deleted!"
		);
	}
	return data;
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

export async function getReviewByUser(animeID, userProfileID) {
	const { data } = await supabase
		.from("item_reviews")
		.select()
		.eq("item_id", animeID)
		.eq("creator_id", userProfileID)
		.throwOnError();
	return data;
}

export async function getReviewList(animeID, userProfileID = null) {
	let list = [];
	if (userProfileID !== null) {
		const userReview = await getReviewByUser(animeID, userProfileID);
		if (userReview.length > 0) {
			list.push(userReview[0]);
		}

		const { data } = await supabase
			.from("item_reviews")
			.select()
			.eq("item_id", animeID)
			.neq("creator_id", userProfileID)
			.throwOnError();
		list = list.concat(data);
	} else {
		const { data } = await supabase
			.from("item_reviews")
			.select()
			.eq("item_id", animeID)
			.throwOnError();
		list = list.concat(data);
	}
	return list;
}

export async function getRecentItems(type, profileID) {
	const { data } = await supabase
		.from("recent_items")
		.select(type)
		.eq("profile_id", profileID)
		.throwOnError();
	return data[0][type];
}

export async function setRecentItem(type, profileID, item) {
	const recentItems = await getRecentItems(type, profileID);
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
