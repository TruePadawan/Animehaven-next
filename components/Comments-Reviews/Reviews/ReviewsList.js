import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Rating, TextareaAutosize } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ReviewItem from "./ReviewItem";
import styles from "../Comments-Reviews.module.css";
import { supabase } from "../../../supabase/config";
import ShareButton from "../../ShareButton/ShareButton";
import {
	getReviewByUser,
	getReviewList,
	numberToString,
} from "../../../utilities/app-utilities";
import ReviewsIcon from "@mui/icons-material/Reviews";

const getItemReviews = async (animeID, count = 4) => {
	const { data: reviews } = await supabase
		.rpc("get_item_reviews", { itemid: animeID, n_reviews: count + 1 })
		.throwOnError();
	return reviews;
};

const getReview = async (animeID, userID) => {
	const { data } = await supabase
		.from("item_reviews")
		.select()
		.eq("creator_id", userID)
		.eq("item_id", animeID)
		.throwOnError()
		.limit(1)
		.single();
	return data;
};

const ReviewsList = ({ profileID, animeID, triggerAlert }) => {
	const [reviewText, setReviewText] = useState("");
	const [reviewListData, setReviewListData] = useState([]);
	const [rating, setRating] = useState(1);
	const [disableAddReviewBtn, setDisableAddReviewBtn] = useState(false);

	const handleError = useCallback(
		(errorText, error) => {
			triggerAlert(errorText, { severity: "error", error });
		},
		[triggerAlert]
	);

	useEffect(() => {
		// IF USER IS SIGNED IN, CHECK IF USER HAS REVIEW THE ANIME AND SHOW THEIRS AT THE TOP
		getReviewList(animeID, profileID)
			.then((list) => {
				setReviewListData(list);
			})
			.catch((error) => {
				handleError("Failed to retrieve reviews", error);
				setReviewListData([]);
			});
	}, [animeID, profileID, handleError]);

	const updateRating = (e, newVal) => setRating(newVal < 1 ? 1 : newVal);
	const textAreaChangeHandler = (e) => setReviewText(e.target.value);

	async function addReview(onReviewAdded) {
		try {
			await supabase
				.from("item_reviews")
				.insert({
					item_id: animeID,
					creator_id: profileID,
					review: reviewText,
					rating,
					upvoted_by: [profileID],
				})
				.throwOnError();

			const list = await getReviewList(animeID, profileID);
			setReviewListData(list);
			onReviewAdded();
		} catch (error) {
			handleError("Failed to add review", error);
		}
	}

	async function updateReview(onReviewUpdated) {
		try {
			const { data: updatedData } = await supabase
				.from("item_reviews")
				.update({
					review: reviewText,
					rating,
				})
				.eq("item_id", animeID)
				.eq("creator_id", profileID)
				.select()
				.throwOnError();

			setReviewListData((snapshot) => {
				snapshot[0] = updatedData[0];
				return [...snapshot];
			});
			onReviewUpdated();
		} catch (error) {
			handleError("Failed to update review", error);
		}
	}

	function editReview(text = "", ratingValue = 1) {
		setReviewText(text);
		setRating(ratingValue);
	}

	async function formSubmitHandler(event) {
		event.preventDefault();
		// SAFETUY CHECK - THERE MUST BE A SIGNEDIN USER BEFORE REVIEW CAN BE POSTED OR UPDATED
		if (profileID === null) return;
		setDisableAddReviewBtn(true);
		// CHECK TO SEE IF THERE IS ALREADY A REVIEW BY THE USER AND UPDATE IT BECAUSE ONLY ONE REVIEW PER ITEM ELSE CREATE ONE
		const reviewData = await getReviewByUser(animeID, profileID);
		const userHasReviewedItem = reviewData.length === 1;
		if (userHasReviewedItem) {
			await updateReview(() => {
				setReviewText("");
				setRating(1);
			});
		} else {
			await addReview(() => {
				setReviewText("");
				setRating(1);
			});
		}
		setDisableAddReviewBtn(false);
	}

	function onShareSuccess() {
		triggerAlert("Link Copied!", { severity: "success" });
	}
	function onShareFailed() {
		triggerAlert("Failed to Copy Link!", { severity: "warning" });
	}

	const noReviews = reviewListData.length === 0;
	const reviewsCountText = numberToString(reviewListData.length, "Review");

	const reviewList = useMemo(() => {
		return reviewListData.map((review) => {
			return (
				<ReviewItem
					key={review.id}
					reviewData={review}
					profileID={profileID}
					editReview={editReview}
					handleError={handleError}
				/>
			);
		});
	}, [reviewListData, handleError, profileID]);

	return (
		<div className={styles.component}>
			{profileID && (
				<Fragment>
					<Rating
						value={rating}
						onChange={updateRating}
						precision={0.5}
						sx={{ width: "max-content" }}
						size="small"
					/>
					<form className={styles.interface} onSubmit={formSubmitHandler}>
						<TextareaAutosize
							className={styles.inputfield}
							title="Review"
							value={reviewText}
							onChange={textAreaChangeHandler}
							spellCheck={false}
							required
						/>
						<button
							type="submit"
							title="Send"
							className={styles.sendBtn}
							disabled={disableAddReviewBtn}>
							<SendIcon />
						</button>
					</form>
				</Fragment>
			)}
			<div className="d-flex flex-column gap-1 w-100">
				<div className="d-flex justify-content-between align-items-center mx-2">
					<span className="d-flex gap-1">
						<ReviewsIcon />
						<span>{reviewsCountText}</span>
					</span>
					<ShareButton
						onShareSuccess={onShareSuccess}
						onShareFailed={onShareFailed}
					/>
				</div>
				{noReviews && (
					<div className="d-flex justify-content-center mt-4">No Reviews</div>
				)}
				{!noReviews && <ul className={styles.items}>{reviewList}</ul>}
			</div>
		</div>
	);
};

export default ReviewsList;
