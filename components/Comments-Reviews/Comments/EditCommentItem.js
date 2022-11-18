import { Button, TextareaAutosize } from "@mui/material";
import { useState } from "react";
import { supabase } from "../../../supabase/config";
import styles from "../Comments-Reviews.module.css";

const EditCommentItem = (props) => {
	const [commentText, setCommentText] = useState(props.defaultValue);
	async function formSubmitHandler(event) {
		event.preventDefault();

		if (commentText.trim().length === 0) {
			props.triggerAlert("Comment must have 1 or more characters", {
				severity: "warning",
			});
		} else {
			try {
				await supabase
					.from("comments")
					.update({ text: commentText })
					.eq("id", props.commentID);
				props.onCommentEdited();
			} catch (error) {
				props.triggerAlert("Failed to edit comment", {
					severity: "error",
					error,
				});
			}
		}
	}

	function changeHandler(event) {
		setCommentText(event.target.value);
	}

	return (
		<form onSubmit={formSubmitHandler} className="d-flex flex-column">
			<TextareaAutosize
				aria-label="Edit Comment"
				className={styles.inputfield}
				defaultValue={commentText}
				onChange={changeHandler}
				required
			/>
			<div className="d-flex gap-1 align-self-end mt-2">
				<Button size="small" type="submit" sx={{ color: "gainsboro" }} variant="contained">
					Update
				</Button>
				<Button size="small" type="button" onClick={props.onCancelEditing} sx={{ color: "brown" }}>
					Cancel
				</Button>
			</div>
		</form>
	);
};

export default EditCommentItem;
