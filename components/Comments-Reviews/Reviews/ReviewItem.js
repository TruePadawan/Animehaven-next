import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { IconButton, Rating, Skeleton } from "@mui/material";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import {
	DEFAULT_AVATAR_URL,
	deleteReview,
	toggleUpvoteForReview,
	getProfileData,
	getReviewUpvoteList,
} from "../../../utilities/app-utilities";
import { UserAuthContext } from "../../../context/UserAuthContext";
import styles from "../Comments-Reviews.module.css";
import Image from "next/image";

const ReviewItem = ({
	reviewID,
	text,
	accountID,
	rating,
	upvotedBy,
	upvoted = false,
	own = false,
	handleError,
}) => {
	const { profileID } = useContext(UserAuthContext);
	const [avatarURL, setAvatarURL] = useState(DEFAULT_AVATAR_URL);
	const [acctName, setAcctName] = useState("");
	const [displayName, setDisplayName] = useState("User");
	const [loading, setLoading] = useState(true);
	const [nUpvotes, setNUpvotes] = useState(upvotedBy.length);
	const [upvoteIcon, setUpvoteIcon] = useState(() => {
		if (upvoted) return <ThumbUpAltIcon />;
		return <ThumbUpOffAltIcon />;
	});
	const [reviewState, setReviewState] = useState({
		deleted: false,
		info: "",
	});

	useEffect(() => {
		getProfileData("*", accountID)
			.then((data) => {
				const { avatar_url, display_name, account_name } = data;
				setAvatarURL(avatar_url);
				setDisplayName(display_name);
				setAcctName(account_name);
				setLoading(false);
			})
			.catch((error) => {
				handleError("Failed to load review data", error);
			});
	}, [accountID, handleError]);

	const upvoteBtnClickHandler = async () => {
		if (own || !profileID) return;

		try {
			const { status, code } = await toggleUpvoteForReview(reviewID, profileID);
			if (status === "COMPLETE") {
				if (code === "UPVOTE_REMOVED") {
					setUpvoteIcon(<ThumbUpOffAltIcon />);
				} else {
					setUpvoteIcon(<ThumbUpAltIcon />);
				}
				const upvotes = await getReviewUpvoteList(reviewID);
				setNUpvotes(upvotes.length);
			} else if (status === "FAILED" && code === "REVIEW_NOT_FOUND") {
				setReviewState({
					deleted: true,
					info: "Review no longer exists",
				});
				return;
			}
		} catch (error) {
			handleError("Failed to complete action", error);
		}
	};

	const deleteBtnClickHandler = async () => {
		if (!own || !profileID) return;

		try {
			const { status } = await deleteReview(reviewID, profileID);
			if (status === "COMPLETE") {
				setReviewState({
					deleted: true,
					info: "Deleted",
				});
			}
		} catch (error) {
			handleError("Failed to delete review", error);
		}
	};

	const upvoteBtnDisabled = !profileID || own;
	const deleteBtnDisabled = !profileID || !own;

	const reviewExists = !loading && !reviewState.deleted;
	const reviewDeleted = !loading && reviewState.deleted;

	const reviewClassName = `${styles.review} ${own ? styles.own : ""}`;

	return (
		<li className={reviewClassName}>
			{loading && (
				<>
					<Skeleton variant="circular" width={40} height={40} />
					<div className="d-flex flex-column flex-grow-1">
						<Skeleton variant="text" sx={{ fontSize: "1rem", width: "30%" }} />
						<Skeleton
							variant="text"
							sx={{ fontSize: "0.6rem", width: "100%" }}
						/>
					</div>
				</>
			)}
			{reviewExists && (
				<>
					<Image
						className={styles.userPhoto}
						src={avatarURL}
						alt={acctName}
						width={40}
						height={40}
						quality={100}
					/>
					<div className="d-flex flex-column flex-grow-1">
						<Link href={`/users/${acctName}`} className={styles.user}>
							{displayName}
						</Link>
						<Rating value={rating} readOnly size="small" precision={0.5} />
						<p className={styles.reviewText}>{text}</p>
						<div className="d-flex justify-content-end gap-2">
							<span className={styles.upvote}>
								<IconButton
									aria-label="upvote"
									size="small"
									disabled={upvoteBtnDisabled}
									onClick={upvoteBtnClickHandler}>
									{upvoteIcon}
								</IconButton>
								<span>{nUpvotes}</span>
							</span>
							<IconButton
								aria-label="delete"
								size="small"
								disabled={deleteBtnDisabled}
								onClick={deleteBtnClickHandler}>
								<DeleteIcon />
							</IconButton>
						</div>
					</div>
				</>
			)}
			{reviewDeleted && (
				<p className="text-center m-0 w-100">{reviewState.info}</p>
			)}
		</li>
	);
};

export default ReviewItem;
