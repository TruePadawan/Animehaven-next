import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Rating, TextareaAutosize } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ReviewItem from "./ReviewItem";
import styles from "../Comments-Reviews.module.css";
import { supabase } from "../../../supabase/config";
import ShareButton from "../../ShareButton/ShareButton";
import { numberToString } from "../../../utilities/app-utilities";
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
		if (profileID !== null) {
			getReview(animeID, profileID)
				.then((reviewData) => {
					const { id, review, rating, upvoted_by } = reviewData;
					setReviewListData((snapshot) => {
						const reviewAlreadyInArray = snapshot.some(
							(item) => item.reviewID === id
						);
						if (!reviewAlreadyInArray) {
							snapshot.unshift({
								reviewID: id,
								reviewText: review,
								rating,
								accountID: profileID,
								upvotedBy: upvoted_by,
								upvoted: true,
								own: true,
							});
							return [...snapshot];
						}
						return snapshot;
					});
				})
				.catch((error) => {
					if (error.code !== "PGRST116") {
						handleError("Failed to retrieve reviews", error);
					}
					setReviewListData([]);
				});
		}
		getItemReviews(animeID)
			.then((reviews) => {
				const list = [];
				reviews.forEach((reviewData) => {
					const { id, creator_id, review, rating, upvoted_by } = reviewData;
					if (profileID !== creator_id) {
						const isUpvoted = upvoted_by.includes(profileID);
						list.push({
							reviewID: id,
							reviewText: review,
							rating,
							accountID: creator_id,
							upvotedBy: upvoted_by,
							upvoted: isUpvoted,
							own: false,
						});
					}
				});
				setReviewListData((snapshot) => {
					return snapshot.concat(list);
				});
			})
			.catch((error) => {
				handleError("Failed to retrieve reviews", error);
				setReviewListData([]);
			});
	}, [animeID, profileID, handleError]);

	const updateRating = (e, newVal) => setRating(newVal < 1 ? 1 : newVal);
	const textAreaChangeHandler = (e) => setReviewText(e.target.value);

	const postReview = async (e) => {
		e.preventDefault();
		if (profileID === null) return;
		// CHECK TO SEE IF THERE IS ALREADY A REVIEW BY THE USER AND UPDATE IT BECAUSE ONLY ONE REVIEW PER ITEM ELSE CREATE ONE
		setDisableAddReviewBtn(true);

		const { data } = await supabase
			.from("item_reviews")
			.select()
			.eq("item_id", animeID)
			.eq("creator_id", profileID)
			.throwOnError();
		const hasReview = data.length === 1;
		// POST REVIEW
		if (hasReview === false) {
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

				// GET THE ID OF THE POSTED REVIEW AND UPDATE THE REVIEW LIST SO UI CAN BE UPDATED WITH NEW REVIEW
				const reviewData = await getReview(animeID, profileID);
				setReviewListData((currentReviews) => {
					currentReviews.unshift({
						reviewID: reviewData.id,
						reviewText: reviewData.review,
						rating,
						accountID: profileID,
						upvotedBy: reviewData.upvoted_by,
						upvoted: true,
						own: true,
					});
					return [...currentReviews];
				});
				setReviewText("");
			} catch (error) {
				handleError("Failed to add review", error);
			}
		} else {
			try {
				// UPDATE REVIEW
				const upvotedBy = data[0].upvoted_by;
				const reviewID = data[0].id;
				await supabase
					.from("item_reviews")
					.update({
						review: reviewText,
						rating,
					})
					.eq("item_id", animeID)
					.eq("creator_id", profileID)
					.throwOnError();

				setReviewListData((currentReviews) => {
					currentReviews[0] = {
						reviewID,
						reviewText,
						rating,
						accountID: profileID,
						upvotedBy,
						upvoted: true,
						own: true,
					};
					return [...currentReviews];
				});
				setReviewText("");
			} catch (error) {
				handleError("Failed to update review", error);
			}
		}
		setDisableAddReviewBtn(false);
	};

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
					key={review.reviewID}
					reviewID={review.reviewID}
					text={review.reviewText}
					rating={review.rating}
					accountID={review.accountID}
					upvotedBy={review.upvotedBy}
					upvoted={review.upvoted}
					own={review.own}
					handleError={handleError}
				/>
			);
		});
	}, [reviewListData, handleError]);

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
					<form className={styles.interface} onSubmit={postReview}>
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
