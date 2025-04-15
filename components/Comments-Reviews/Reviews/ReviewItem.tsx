import {Fragment, useEffect, useState} from "react";
import Link from "next/link";
import {IconButton, Rating, Skeleton, MenuItem} from "@mui/material";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    deleteReview,
    toggleUpvoteForReview,
    getProfileData,
    getReviewUpvoteList,
} from "../../../utilities/app-utilities";
import styles from "../Comments-Reviews.module.css";
import Image from "next/image";
import MoreOptions from "../MoreOptions";
import {usePopupState} from "material-ui-popup-state/hooks";
import {useSupabaseClient} from "@supabase/auth-helpers-react";
import {ReviewItemProps} from "./types/ReviewItem.types";
import {Database} from "../../../database.types";
import {DEFAULT_AVATAR_URL} from "../../../utilities/global-constants";

// Rename to AnimeReviewItem
const ReviewItem = (props: ReviewItemProps) => {
    const {reviewData, profileID, editReview, handleError} = props;
    const supabase = useSupabaseClient<Database>();
    const [profileData, setProfileData] = useState({
        avatar_url: DEFAULT_AVATAR_URL,
        account_name: "",
        display_name: "",
    });
    const [loading, setLoading] = useState(true);
    const [numberOfUpvote, setNumberOfUpvote] = useState(reviewData.upvoted_by.length);
    const [upvoteIcon, setUpvoteIcon] = useState(() => {
        if (profileID && reviewData.upvoted_by.includes(profileID)) {
            return <ThumbUpAltIcon/>;
        }
        return <ThumbUpOffAltIcon/>;
    });
    const [reviewState, setReviewState] = useState({
        deleted: false,
        info: "",
    });
    const popupState = usePopupState({
        variant: "popover",
        popupId: "more-options-menu-popup",
    });
    const ownReview = reviewData.creator_id === profileID;

    // LOAD REVIEW
    useEffect(() => {
        const {creator_id} = reviewData;
        getProfileData(supabase, creator_id)
            .then((data) => {
                setProfileData({
                    avatar_url: data.avatar_url,
                    account_name: data.account_name,
                    display_name: data.display_name ?? ""
                });
                setLoading(false);
            })
            .catch((error) => {
                handleError("Failed to load review", error);
            });
    }, [reviewData, handleError, supabase]);

    const onUpvoteButtonClicked = async () => {
        if (ownReview || profileID === undefined) return;

        const {id: reviewID} = reviewData;
        try {
            const {status, code} = await toggleUpvoteForReview(
                supabase,
                reviewID,
                profileID
            );
            if (status === "COMPLETE") {
                if (code === "UPVOTE_REMOVED") {
                    setUpvoteIcon(<ThumbUpOffAltIcon/>);
                } else {
                    setUpvoteIcon(<ThumbUpAltIcon/>);
                }
                const upvotes = await getReviewUpvoteList(supabase, reviewID);
                setNumberOfUpvote(upvotes.length);
            } else if (status === "FAILED" && code === "REVIEW_NOT_FOUND") {
                setReviewState({
                    deleted: true,
                    info: "Review no longer exists",
                });
            }
        } catch (error) {
            handleError("Failed to complete action", error);
        }
    };

    const onDeleteButtonClicked = async () => {
        if (!ownReview || profileID === undefined) return;

        const {id: reviewID} = reviewData;
        try {
            const {status} = await deleteReview(supabase, reviewID, profileID);
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

    const handleEditing = () => {
        editReview(reviewData.review, reviewData.rating);
        popupState.close();
    };

    const menuItemStyles = {fontFamily: "'Rubik', sans-serif"};

    const upvoteBtnDisabled = !profileID || ownReview;
    const deleteBtnDisabled = !profileID || !ownReview;

    const reviewExists = !loading && !reviewState.deleted;
    const reviewDeleted = !loading && reviewState.deleted;

    const reviewClassName = `${styles.review} ${
        ownReview ? styles.ownReview : ""
    }`;

    const showMoreOptions =
        profileID !== undefined && profileID === reviewData.creator_id;
    const {avatar_url, display_name, account_name} = profileData;
    return (
        <li className={reviewClassName}>
            {loading && (
                <Fragment>
                    <Skeleton variant="circular" width={40} height={40}/>
                    <div className="d-flex flex-column flex-grow-1">
                        <Skeleton variant="text" sx={{fontSize: "1rem", width: "30%"}}/>
                        <Skeleton
                            variant="text"
                            sx={{fontSize: "0.6rem", width: "100%"}}
                        />
                    </div>
                </Fragment>
            )}
            {reviewExists && (
                <Fragment>
                    <Image
                        className={styles.userPhoto}
                        src={avatar_url}
                        alt={account_name}
                        width={40}
                        height={40}
                        quality={100}
                    />
                    <div className="d-flex flex-column flex-grow-1">
                        <div className="d-flex justify-content-between">
                            <div className="d-flex flex-column">
                                <Link href={`/users/${account_name}`} className={styles.user}>
                                    {display_name}
                                </Link>
                                <Rating
                                    value={reviewData.rating}
                                    size="small"
                                    precision={0.5}
                                    readOnly
                                />
                                <p className={styles.reviewText}>{reviewData.review}</p>
                            </div>
                            {showMoreOptions && (
                                <MoreOptions popupState={popupState}>
                                    <MenuItem sx={menuItemStyles} onClick={handleEditing}>
                                        Edit
                                    </MenuItem>
                                </MoreOptions>
                            )}
                        </div>
                        <div className="d-flex justify-content-end gap-2">
							<span className={styles.upvote}>
								<IconButton
                                    aria-label="Upvote"
                                    title="Upvote"
                                    size="small"
                                    disabled={upvoteBtnDisabled}
                                    onClick={onUpvoteButtonClicked}>
									{upvoteIcon}
								</IconButton>
								<span>{numberOfUpvote}</span>
							</span>
                            <IconButton
                                aria-label="delete"
                                title="delete"
                                size="small"
                                disabled={deleteBtnDisabled}
                                onClick={onDeleteButtonClicked}>
                                <DeleteIcon/>
                            </IconButton>
                        </div>
                    </div>
                </Fragment>
            )}
            {reviewDeleted && (
                <p className="text-center m-0 w-100">{reviewState.info}</p>
            )}
        </li>
    );
};

export default ReviewItem;
