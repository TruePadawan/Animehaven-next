import {
	Fragment,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Alert, Button, Rating, TextareaAutosize } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ReviewItem from "./ReviewItem";
import styles from "../Comments-Reviews.module.css";
import ShareButton from "../../ShareButton/ShareButton";
import {
	getReviewByUser,
	getReviewsData,
	numberToString,
} from "../../../utilities/app-utilities";
import ReviewsIcon from "@mui/icons-material/Reviews";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const REVIEWS_PER_REQUESTS = 10;
const ReviewsList = ({ profileID, animeID, triggerAlert }) => {
	const supabase = useSupabaseClient();
	const [reviewText, setReviewText] = useState("");
	const [reviewListData, setReviewListData] = useState([]);
	const [rating, setRating] = useState(1);
	const [disableAddReviewBtn, setDisableAddReviewBtn] = useState(false);
	const [loadingReviews, setLoadingReviews] = useState(false);
	const totalReviewsCount = useRef(0);

	const handleError = useCallback(
		(errorText, error) => {
			triggerAlert(errorText, { severity: "error", error });
		},
		[triggerAlert]
	);

	useEffect(() => {
		// IF USER IS SIGNED IN, CHECK IF USER HAS REVIEW THE ANIME AND SHOW THEIRS AT THE TOP
		getReviewsData(supabase, animeID, profileID)
			.then(({ data, count }) => {
				totalReviewsCount.current = count;
				setReviewListData(data);
			})
			.catch((error) => {
				handleError("Failed to retrieve reviews", error);
				setReviewListData([]);
			});
	}, [animeID, profileID, handleError, supabase]);

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

			const list = await getReviewsData(supabase, animeID, profileID);
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
		const reviewData = await getReviewByUser(supabase, animeID, profileID);
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

	async function loadMoreReviewsClickHandler() {
		setLoadingReviews(true);
		const lastReviewIndex = reviewListData.at(-1).index;
		try {
			const { data } = await getReviewsData(
				supabase,
				animeID,
				REVIEWS_PER_REQUESTS,
				lastReviewIndex
			);
			setReviewListData((snapshot) => {
				return [...snapshot, ...data];
			});
		} catch (error) {
			triggerAlert("Failed to load more reviews", {
				severity: "error",
				error,
			});
		}
		setLoadingReviews(false);
	}

	const noReviews = reviewListData.length === 0;
	const moreReviews = reviewListData.length < totalReviewsCount.current;
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
					<Alert severity="info">
						Only 1 review allowed per anime. Adding another simply updates the
						existing review.
					</Alert>
					<Rating
						value={rating}
						onChange={updateRating}
						precision={0.5}
						sx={{ width: "max-content" }}
						className="mt-2"
						size="small"
					/>
					<form className={styles.interface} onSubmit={formSubmitHandler}>
						<TextareaAutosize
							aria-label="Review"
							title="Review"
							className={styles.inputfield}
							value={reviewText}
							onChange={textAreaChangeHandler}
							spellCheck={false}
							required
						/>
						<button
							type="submit"
							aria-label="Send"
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
				{!noReviews && (
					<Fragment>
						<ul className={styles.items}>{reviewList}</ul>
						{moreReviews && (
							<Button
								type="button"
								variant="contained"
								sx={{ backgroundColor: "dimgray" }}
								disabled={loadingReviews}
								onClick={loadMoreReviewsClickHandler}>
								Load More Reviews
							</Button>
						)}
					</Fragment>
				)}
			</div>
		</div>
	);
};

export default ReviewsList;
