import { Divider, IconButton, Menu, MenuItem, Skeleton } from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import Link from "next/link";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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
import { bindMenu, bindTrigger } from "material-ui-popup-state";
import { usePopupState } from "material-ui-popup-state/hooks";
import { supabase } from "../../../supabase/config";
import Image from "next/image";

const CommentItem = (props) => {
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
	const [menuAnchorEl, setMenuAnchorEl] = useState(null);
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

		getProfileData("account_name,display_name,avatar_url", creator_id)
			.then(async (profileData) => {
				setCommentCreatorData(profileData);

				const isReply = parent_comment_id !== null;
				if (isReply) {
					try {
						const parentCommentData = await getCommentData(parent_comment_id);
						const { text, creator_id: parentCommentCreatorID } =
							parentCommentData;
						const profileDataForParentCommentCreator = await getProfileData(
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
	}, [commentData, triggerAlert]);

	// LISTEN FOR WHEN PARENT COMMENT IS UPDATED
	useEffect(() => {
		const onParentCommentUpdated = (payload) => {
			setParentCommentData((snapshot) => {
				return { ...snapshot, text: payload.new.text };
			});
		};

		const refCommentID = parentCommentData.id;
		let updatesChannel = null;
		if (refCommentID !== null) {
			updatesChannel = supabase
				.channel(`public:comments:id=eq.${refCommentID}`)
				.on(
					"postgres_changes",
					{
						event: "UPDATE",
						schema: "public",
						table: "comments",
						filter: `id=eq.${refCommentID}`,
					},
					onParentCommentUpdated
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

	const openMenu = (event) => {
		setMenuAnchorEl(event.currentTarget);
	};
	const closeMenu = () => {
		setMenuAnchorEl(null);
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
			await toggleUpvoteForComment(commentData.id, profileID);
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

	const menuOpen = Boolean(menuAnchorEl);
	const menuPaperProps = {
		sx: {
			backgroundColor: "#1B1B1B",
			color: "white",
		},
	};
	const menuAnchorOrigin = {
		vertical: "top",
		horizontal: "right",
	};
	const menuItemStyles = { fontFamily: "'Rubik', sans-serif" };
	const dividerStyles = {
		backgroundColor: "darkgrey",
		height: "2px",
		margin: "0px!important",
	};
	const moreOptionsBtnStyles = {
		alignSelf: "flex-start",
		padding: "0",
		color: "whitesmoke",
	};
	const { avatar_url, display_name, account_name } = commentCreatorData;
	const ON_EDIT_COMMENT = commentState === "EDITING";
	const {
		creator_account_name: parentCommentCreatorAccountName,
		creator_display_name: parentCommentCreatorDisplayName,
		text: parentCommentText,
	} = parentCommentData;

	const allowCommentModification =
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
									{allowCommentModification && (
										<Fragment>
											<IconButton
												aria-label="more"
												id="more-options-btn"
												aria-controls={
													menuOpen ? "more-options-menu" : undefined
												}
												aria-expanded={menuOpen ? "true" : undefined}
												aria-haspopup="true"
												onClick={openMenu}
												sx={moreOptionsBtnStyles}
												{...bindTrigger(popupState)}>
												<MoreVertIcon />
											</IconButton>
											<Menu
												id="more-options-menu"
												MenuListProps={{
													"aria-labelledby": "more-options-btn",
												}}
												anchorEl={menuAnchorEl}
												open={menuOpen}
												onClose={closeMenu}
												PaperProps={menuPaperProps}
												anchorOrigin={menuAnchorOrigin}
												{...bindMenu(popupState)}>
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
											</Menu>
										</Fragment>
									)}
								</div>

								<div className="d-flex justify-content-end gap-2">
									<span className={styles.upvote}>
										<IconButton
											aria-label="upvote"
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
