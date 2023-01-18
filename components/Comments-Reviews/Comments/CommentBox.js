import { useState } from "react";
import { IconButton, TextareaAutosize, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CancelIcon from "@mui/icons-material/Cancel";
import styles from "../Comments-Reviews.module.css";
import Link from "next/link";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const CommentBox = (props) => {
	const [commentText, setCommentText] = useState("");
	const [sendBtnDisabled, setSendBtnDisabled] = useState(false);
	const supabase = useSupabaseClient();

	const commentTextChangeHandler = (event) => {
		setCommentText(event.target.value);
	};

	const postComment = async (commentText) => {
		await supabase
			.from("comments")
			.insert({
				instance_id: props.instanceID,
				text: commentText,
				creator_id: props.profileID,
			})
			.throwOnError();
		if (props.onCommentPosted !== undefined) {
			props.onCommentPosted();
		}
	};

	const postReply = async (commentText) => {
		const { parentCommentID } = props.replyData;
		if (parentCommentID === "") {
			throw new Error("No parent comment set for reply");
		}
		await supabase
			.from("comments")
			.insert({
				instance_id: props.instanceID,
				text: commentText,
				creator_id: props.profileID,
				parent_comment_id: parentCommentID,
			})
			.throwOnError();
		if (props.onReplyPosted !== undefined) {
			props.onReplyPosted();
		}
	};

	// HANDLE POSTING COMMENT OR REPLY
	const formSubmitHandler = async (event) => {
		event.preventDefault();
		if (commentText.trim().length === 0) {
			props.triggerAlert("Comment must have 1 or more characters", {
				severity: "warning",
			});
			setCommentText("");
			return;
		}

		setSendBtnDisabled(true);
		if (props.replying) {
			try {
				await postReply(commentText);
				setCommentText("");
			} catch (error) {
				props.triggerAlert("Failed to post reply to comment", {
					severity: "error",
					error,
				});
			}
		} else {
			try {
				await postComment(commentText);
				setCommentText("");
			} catch (error) {
				props.triggerAlert("Failed to post comment", {
					severity: "error",
					error,
				});
			}
		}
		setSendBtnDisabled(false);
	};

	const referencedCommentAccountName = props.replyData.accountName;
	const textareaClassName = `${styles.inputfield} ${
		props.replying ? styles.updating : ""
	}`;
	return (
		<form className={styles.interface} onSubmit={formSubmitHandler}>
			<div className={styles["comment-input-container"]}>
				{props.replying && (
					<div className={styles["reply-info"]}>
						<Typography variant="caption" sx={{ fontFamily: "inherit" }}>
							Replying to{" "}
							<Link
								href={`/users/${referencedCommentAccountName}`}
								className={styles["referenced-comment-accountname"]}>
								@{referencedCommentAccountName}
							</Link>
						</Typography>
						<IconButton
							size="small"
							type="button"
							sx={{ padding: "0" }}
							onClick={props.cancelReply}>
							<CancelIcon sx={{ color: "darkgrey" }} />
						</IconButton>
					</div>
				)}
				<TextareaAutosize
					aria-label="Comment"
					title="Comment"
					className={textareaClassName}
					spellCheck={false}
					value={commentText}
					onChange={commentTextChangeHandler}
					required
				/>
			</div>
			<button
				type="submit"
				title="Send"
				className={styles.sendBtn}
				disabled={sendBtnDisabled}>
				<SendIcon />
			</button>
		</form>
	);
};

export default CommentBox;
