import { Divider, IconButton, MenuItem, Skeleton } from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import {
	getProfileData,
	getCommentData,
	toggleUpvoteForComment,
} from "../../../utilities/app-utilities";
import Reply from "./Reply";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import styles from "../Comments-Reviews.module.css";
import EditCommentItem from "./EditCommentItem";
import Image from "next/image";
import MoreOptions from "../MoreOptions";
import { usePopupState } from "material-ui-popup-state/hooks";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const CommentItem = (props) => {
	const supabase = useSupabaseClient();
	const { commentData, setReplyData, triggerAlert, profileID } = props;
	const [commentCreatorData, setCommentCreatorData] = useState({
		avatar_url: null,
		account_name: null,
		display_name: null,
	});
	const [parentCommentData, setParentCommentData] = useState({
		id: null,
		text: null,
		creator_display_name: null,
		creator_account_name: null,
	});
	const [parentCommentIsDeleted, setParentCommentIsDeleted] = useState(false);
	const [commentState, setCommentState] = useState("DEFAULT");
	const [btnIsDisabled, setBtnIsDisabled] = useState({
		upvote: profileID === null,
		reply: profileID === null,
	});
	const popupState = usePopupState({
		variant: "popover",
		popupId: "more-options-menu-popup",
	});

	// LOAD COMMENT
	useEffect(() => {
		const { creator_id, parent_comment_id } = commentData;

		getProfileData(supabase, "account_name,display_name,avatar_url", creator_id)
			.then(async (profileData) => {
				setCommentCreatorData(profileData);

				const isReply = parent_comment_id !== null;
				if (isReply) {
					try {
						const parentCommentData = await getCommentData(
							supabase,
							parent_comment_id
						);
						const { text, creator_id: parentCommentCreatorID } =
							parentCommentData;
						const profileDataForParentCommentCreator = await getProfileData(
							supabase,
							"display_name,account_name",
							parentCommentCreatorID
						);
						const { display_name, account_name } =
							profileDataForParentCommentCreator;
						setParentCommentData({
							id: parent_comment_id,
							text,
							creator_display_name: display_name,
							creator_account_name: account_name,
						});
					} catch (error) {
						if (error.code === "PGRST116") {
							setParentCommentIsDeleted(true);
						} else {
							triggerAlert("Failed to load data for referenced comment", {
								severity: "error",
								error,
							});
						}
					}
				}
			})
			.catch((error) => {
				triggerAlert("Failed to load comment data", {
					severity: "error",
					error,
				});
			});
	}, [commentData, supabase, triggerAlert]);

	// LISTEN FOR WHEN PARENT COMMENT IS UPDATED OR DELETED
	useEffect(() => {
		const onParentCommentUpdated = (payload) => {
			setParentCommentData((snapshot) => {
				return { ...snapshot, text: payload.new.text };
			});
		};

		const onParentCommentDeleted = (payload) => {
			setParentCommentIsDeleted(payload.old.id === parentCommentData.id);
		};

		const parentCommentID = parentCommentData.id;
		let updatesChannel = null;
		if (parentCommentID !== null) {
			updatesChannel = supabase
				.channel(`public:comments:id=eq.${parentCommentID}`)
				.on(
					"postgres_changes",
					{
						event: "UPDATE",
						schema: "public",
						table: "comments",
						filter: `id=eq.${parentCommentID}`,
					},
					onParentCommentUpdated
				)
				.on(
					"postgres_changes",
					{
						event: "DELETE",
						schema: "public",
						table: "comments",
						filter: `id=eq.${parentCommentID}`,
					},
					onParentCommentDeleted
				)
				.subscribe();
		}

		return () => {
			if (parentCommentData.id) {
				supabase.removeChannel(updatesChannel);
			}
		};
	}, [commentData, parentCommentData]);

	const deleteComment = async (closeMenu) => {
		try {
			await supabase
				.from("comments")
				.delete()
				.eq("id", commentData.id)
				.throwOnError();
		} catch (error) {
			triggerAlert("Failed to delete comment", { severity: "error", error });
		}
		closeMenu();
	};

	// REFERENCE A COMMENT IN A REPLY
	const setAsParentComment = async () => {
		if (profileID === null) return;

		setBtnIsDisabled((snapshot) => {
			return { ...snapshot, reply: true };
		});

		const { id: commentID, creator_id } = commentData;
		try {
			const { data: response } = await supabase
				.from("profiles")
				.select("account_name")
				.eq("id", creator_id)
				.throwOnError()
				.limit(1)
				.single();

			setReplyData({
				parentCommentID: commentID,
				accountName: response.account_name,
			});
		} catch (error) {
			triggerAlert(
				"Error while trying to get data on account associated with comment",
				{ severity: "error", error }
			);
		}
		setBtnIsDisabled((snapshot) => {
			return { ...snapshot, reply: false };
		});
	};

	const handleUpvote = async () => {
		if (profileID === null) return;
		setBtnIsDisabled((snapshot) => {
			return { ...snapshot, upvote: true };
		});
		try {
			await toggleUpvoteForComment(supabase, commentData.id, profileID);
		} catch (error) {
			triggerAlert("Failed to complete action", { severity: "error", error });
		}
		setBtnIsDisabled((snapshot) => {
			return { ...snapshot, upvote: false };
		});
	};

	const handleEditing = (closeMenu) => {
		setCommentState("EDITING");
		closeMenu();
	};

	const loading = commentCreatorData.account_name === null;
	if (loading) {
		return (
			<Fragment>
				<Skeleton variant="circular" width={40} height={40} />
				<div className="d-flex flex-column flex-grow-1">
					<Skeleton variant="text" sx={{ fontSize: "1rem", width: "30%" }} />
					<Skeleton variant="text" sx={{ fontSize: "0.6rem", width: "100%" }} />
				</div>
			</Fragment>
		);
	}
	const menuItemStyles = { fontFamily: "'Rubik', sans-serif" };
	const dividerStyles = {
		backgroundColor: "darkgrey",
		height: "2px",
		margin: "0px!important",
	};
	const { avatar_url, display_name, account_name } = commentCreatorData;
	const ON_EDIT_COMMENT = commentState === "EDITING";
	const {
		creator_account_name: parentCommentCreatorAccountName,
		creator_display_name: parentCommentCreatorDisplayName,
		text: parentCommentText,
	} = parentCommentData;

	const showMoreOptions =
		profileID !== null && profileID === commentData.creator_id;

	const upvoteList = commentData.upvoted_by;
	const upvoteIcon = upvoteList.includes(profileID) ? (
		<ThumbUpAltIcon />
	) : (
		<ThumbUpOffAltIcon />
	);

	const nUpvotes = upvoteList.length;
	return (
		<li id={commentData.id}>
			<Fragment>
				<Reply
					isDeleted={parentCommentIsDeleted}
					creatorName={parentCommentCreatorDisplayName}
					commentText={parentCommentText}
					profileLink={`/users/${parentCommentCreatorAccountName}`}
				/>
				<div className={styles.comment}>
					<Fragment>
						<Image
							className={styles.userPhoto}
							src={avatar_url}
							alt={display_name}
							width={40}
							height={40}
							quality={100}
						/>
						{!ON_EDIT_COMMENT && (
							<div className="d-flex flex-column flex-grow-1">
								<div className="d-flex justify-content-between">
									<div className="d-flex flex-column">
										<Link
											href={`/users/${account_name}`}
											className={styles.user}>
											{display_name}
										</Link>
										<p className={styles.commentText}>{commentData.text}</p>
									</div>
									{showMoreOptions && (
										<MoreOptions popupState={popupState}>
											<MenuItem
												sx={menuItemStyles}
												onClick={handleEditing.bind(this, popupState.close)}>
												Edit
											</MenuItem>
											<Divider sx={dividerStyles} />
											<MenuItem
												sx={menuItemStyles}
												onClick={deleteComment.bind(this, popupState.close)}>
												Delete
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
											type="button"
											onClick={handleUpvote}
											disabled={btnIsDisabled.upvote}>
											{upvoteIcon}
										</IconButton>
										<span>{nUpvotes}</span>
									</span>

									<IconButton
										aria-label="reply"
										title="reply"
										size="small"
										type="button"
										disabled={btnIsDisabled.reply}
										onClick={setAsParentComment}>
										<ReplyIcon />
									</IconButton>
								</div>
							</div>
						)}
						{ON_EDIT_COMMENT && (
							<div className="d-flex flex-column flex-grow-1">
								<Link href={`/users/${account_name}`} className={styles.user}>
									{display_name}
								</Link>
								<EditCommentItem
									defaultValue={commentData.text}
									commentID={commentData.id}
									triggerAlert={triggerAlert}
									onCommentEdited={() => setCommentState("DEFAULT")}
									onCancelEditing={() => setCommentState("DEFAULT")}
								/>
							</div>
						)}
					</Fragment>
				</div>
			</Fragment>
		</li>
	);
};

export default CommentItem;
