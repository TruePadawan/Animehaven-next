import {filetypemime} from "magic-bytes.js";
import {PROFILE_IMG_MAX_SIZE} from "./global-constants";
import {SupabaseClient} from "@supabase/supabase-js";
import {Database, Tables, TablesInsert} from "../database.types";
import {Anime} from "@tutkli/jikan-ts";


export function getRelevantAnimeData(anime: Anime) {
	const id = anime["mal_id"];
	const title = anime.title_english ?? anime.title;
	const imageURL = anime.images.webp === undefined ? anime.images.jpg["image_url"] : anime.images.webp["image_url"];
	const type = anime.type;
	const score = anime.score;
	const genres = anime.genres;
	const overview = anime["synopsis"] ?? "";

	return { id, title, imageURL, type, score, genres, overview };
}

export function getRandomInt(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createProfile(supabase: SupabaseClient<Database>, accountData: TablesInsert<"profiles">) {
	return supabase.from("profiles").insert(accountData);
}

export async function hasProfile(supabase: SupabaseClient<Database>, profileId: Tables<"profiles">["id"]) {
	const { count } = await supabase
		.from("profiles")
		.select("*", { count: "exact", head: true })
		.eq("id", profileId)
		.throwOnError();
	return count === 1;
}

export async function getCommentsData(
	supabase: SupabaseClient<Database>,
	instanceId: Tables<"comments">["instance_id"],
	limit: number,
	startAfterIndex?: number,
) {
	if (startAfterIndex === undefined) {
		const { data, error, count } = await supabase
			.from("comments")
			.select("*", { count: "exact" })
			.eq("instance_id", instanceId)
			.limit(limit)
			.order("created_at", { ascending: false });
		if (error) throw error;
		return { data, count: count ?? 0 };
	} else {
		const { data, error, count } = await supabase
			.from("comments")
			.select("*", { count: "exact" })
			.eq("instance_id", instanceId)
			.lt("index", startAfterIndex)
			.limit(limit)
			.order("created_at", { ascending: false });
		if (error) throw error;
		return { data, count: count ?? 0 };
	}
}

export async function getCommentData(supabase: SupabaseClient<Database>, commentId: Tables<"comments">["id"], fields = "*") {
	const { data } = await supabase
		.from("comments")
		.select(fields)
		.eq("id", commentId)
		.throwOnError()
		.limit(1)
		.single();
	return data;
}

export async function getProfileData(supabase: SupabaseClient<Database>, fields: string, profileId: Tables<"profiles">["id"]) {
	const { data } = await supabase
		.from("profiles")
		.select(fields)
		.eq("id", profileId)
		.throwOnError()
		.limit(1)
		.single();
	return data;
}

export async function getProfileID(supabase: SupabaseClient<Database>, accountName: string) {
	const { data, error } = await supabase
		.from("profiles")
		.select("id")
		.eq("account_name", accountName);
	if (error) throw error;
	if (data.length === 1) {
		return data[0].id;
	}
	return null;
}

export async function getReviewUpvoteList(supabase: SupabaseClient<Database>, reviewId: Tables<"item_reviews">["id"]) {
	const { data, error } = await supabase
		.from("item_reviews")
		.select("upvoted_by")
		.eq("id", reviewId)
		.limit(1)
		.single();
	if (error) throw error;
	return data.upvoted_by;
}

export async function reviewExist(supabase: SupabaseClient<Database>, reviewId: Tables<"item_reviews">["id"]) {
	const { count } = await supabase
		.from("item_reviews")
		.select("*", { count: "exact", head: true })
		.eq("id", reviewId);
	return count === 1;
}

export async function toggleUpvoteForReview(supabase: SupabaseClient<Database>, reviewId: Tables<"item_reviews">["id"], profileId: Tables<"profiles">["id"]) {
	if (!profileId) {
		throw new Error("NO_PROFILE_ID_SPECIFIED");
	}
	// CONFIRM THAT REVIEW EXISTS
	try {
		const exist = await reviewExist(supabase, reviewId);
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
		profile_id: profileId,
		review_id: reviewId,
	});

	if (error) throw error;
	return {
		status: "COMPLETE",
		code: data,
	};
}

export async function deleteReview(supabase: SupabaseClient<Database>, reviewId: Tables<"item_reviews">["id"], profileId: Tables<"profiles">["id"]) {
	if (!profileId) {
		throw new Error("NO_PROFILE_ID_SPECIFIED");
	}
	// CONFIRM THAT REVIEW EXISTS
	try {
		const exist = await reviewExist(supabase, reviewId);
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
		.eq("id", reviewId)
		.eq("creator_id", profileId)
		.throwOnError();

	return {
		status: "COMPLETE",
		code: "REVIEW_DELETED",
	};
}

export async function toggleUpvoteForComment(supabase: SupabaseClient<Database>, commentId: Tables<"comments">["id"], profileId: Tables<"profiles">["id"]) {
	if (!profileId) {
		throw new Error("NO_PROFILE_ID_SPECIFIED");
	}

	const { data, error } = await supabase.rpc("toggle_comment_upvote", {
		comment_id: commentId,
		profile_id: profileId,
	});

	if (error) throw error;
	return {
		status: "COMPLETE",
		code: data,
	};
}

export async function getUserItemRecommendations(supabase: SupabaseClient<Database>, profileId: Tables<"profiles">["id"]) {
	return supabase
		.from("item_recommendations")
		.select()
		.eq("recommended_by", profileId)
		.throwOnError();
}

export async function getUserItemReviews(supabase: SupabaseClient<Database>, profileId: Tables<"profiles">["id"]) {
	return supabase
		.from("item_reviews")
		.select()
		.eq("creator_id", profileId)
		.throwOnError();
}

export async function getDiscussionsByTags(supabase: SupabaseClient<Database>, tags: string[], profileId: Tables<"profiles">["id"] | null = null) {
	if (profileId === null) {
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
			.eq("creator_id", profileId)
			.throwOnError();
		return data;
	}
}

export async function getDiscussionByID(supabase: SupabaseClient<Database>, discussionId: Tables<"discussions">["id"]) {
	if (!discussionId) {
		throw new Error(`Invalid argument passed - ${discussionId}`);
	}
	const { data, error } = await supabase
		.from("discussions")
		.select("*")
		.eq("id", discussionId);
	if (error) throw error;
	
	if (data.length === 0) {
		throw new Error(`Discussion with id - ${discussionId} not found!`);
	}
	return data[0];
}

export async function getDiscussionByAccountName(supabase: SupabaseClient<Database>, accountName: string) {
	if (!accountName) {
		throw new Error(`Invalid argument passed - ${accountName}`);
	}
	const id = await getProfileID(supabase, accountName);
	const { data, error } = await supabase
		.from("discussions")
		.select("*")
		.eq("creator_id", id);
	if (error) throw error;
	return data;
}

export async function getListByID(supabase: SupabaseClient<Database>, animelistId: Tables<"anime_lists">["id"]) {
	if (!animelistId) {
		throw new Error(`Invalid argument passed - ${animelistId}`);
	}
	const { data, error } = await supabase
		.from("anime_lists")
		.select("*")
		.eq("id", animelistId);
	if (error) throw error;
	if (data.length === 0) {
		throw new Error(
			"List data could not be retrieved. It might be private or deleted!"
		);
	}
	return data[0];
}

export function numberToString(count: number, appendString: string) {
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

export async function getReviewByUser(supabase: SupabaseClient<Database>, animeId: string, profileId: string) {
	const { data, error } = await supabase
		.from("item_reviews")
		.select()
		.eq("item_id", animeId)
		.eq("creator_id", profileId);
	if (error) throw error;
	return data;
}

export async function getReviewsData(
	supabase: SupabaseClient<Database>,
	animeId: string,
	limit: number,
	startAfterIndex?: number,
	profileId?: string
) {
	let list: Tables<"item_reviews">[] = [];
	let totalReviewsCount = 0;
	// GET USER REVIEW FIRST BEFORE OTHER REVIEWS IF PROFILE ID SPECIFIED
	if (profileId !== undefined) {
		const userReview = await getReviewByUser(supabase, animeId, profileId);
		if (userReview.length > 0) {
			list.push(userReview[0]);
			totalReviewsCount += 1;
		}

		if (startAfterIndex !== undefined) {
			const { data, error, count } = await supabase
				.from("item_reviews")
				.select("*", { count: "exact" })
				.eq("item_id", animeId)
				.neq("creator_id", profileId)
				.limit(limit)
				.lt("index", startAfterIndex)
				.order("created_at", { ascending: false });
			if (error) throw error;

			totalReviewsCount += count ?? 0;
			list = list.concat(data);
		} else {
			const { data, error, count } = await supabase
				.from("item_reviews")
				.select("*", { count: "exact" })
				.eq("item_id", animeId)
				.neq("creator_id", profileId)
				.limit(limit)
				.order("created_at", { ascending: false });
			if (error) throw error;

			totalReviewsCount += count ?? 0;
			list = list.concat(data);
		}
	} else {
		if (startAfterIndex !== null) {
			const { data, error, count } = await supabase
				.from("item_reviews")
				.select("*", { count: "exact" })
				.eq("item_id", animeId)
				.limit(limit)
				.lt("index", startAfterIndex)
				.order("created_at", { ascending: false });
			if (error) throw error;

			totalReviewsCount += count ?? 0;
			list = list.concat(data);
		} else {
			const { data, error, count } = await supabase
				.from("item_reviews")
				.select("*", { count: "exact" })
				.eq("item_id", animeId)
				.limit(limit)
				.order("created_at", { ascending: false });
			if (error) throw error;

			totalReviewsCount += count ?? 0;
			list = list.concat(data);
		}
	}

	return { data: list, count: totalReviewsCount };
}

export async function getRecentItems(supabase: SupabaseClient<Database>, type: string, profileId: string) {
	const { data, error } = await supabase
		.from("recent_items")
		.select(type)
		.eq("profile_id", profileId);
	if (error) throw error;
	// @ts-ignore
	// TODO: split recent_items table into separate tables
	return data[0][type];
}

export async function setRecentItem(supabase: SupabaseClient<Database>, type: string, profileId: string, item: any) {
	const recentItems = await getRecentItems(supabase, type, profileId);
	let itemAlreadyExists = false;
	if (type === "animes") {
		itemAlreadyExists = recentItems.some((r_item: { id: any; }) => r_item.id === item.id);
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
				.eq("profile_id", profileId)
				.throwOnError();
		} catch (error) {
			throw new Error(`Failed to update recent items - ${getErrorMessage(error)}`);
		}
	}
}

// TODO: look for an alternative library to detect file types accurately
export function verifyProfileImage(file: File, onVerificationComplete: (isValid: boolean) => void) {
	let isValidSize = file.size <= PROFILE_IMG_MAX_SIZE;
	if (isValidSize) {
		// CONFIRM FILE IS AN IMAGE
		const fileReader = new FileReader();
		fileReader.addEventListener("loadend", (event) => {
			// @ts-ignore
			const bytes = new Uint8Array(event.target.result);
			// @ts-ignore
			const fileType = filetypemime(bytes);
			let isValid = false;
			if (fileType.length > 0) {
				// @ts-ignore
				isValid = fileType.at(0).split("/").at(0) === "image";
			}
			onVerificationComplete(isValid);
		});
		fileReader.readAsArrayBuffer(file);
	} else {
		onVerificationComplete(false);
	}
}

export function getErrorMessage(error: any) {
	return error?.message || error?.error_description || "";
}