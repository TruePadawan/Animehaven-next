import {Button, TextareaAutosize} from "@mui/material";
import {ChangeEvent, FormEvent, useState} from "react";
import styles from "../Comments-Reviews.module.css";
import {useSupabaseClient} from "@supabase/auth-helpers-react";
import {EditCommentItemProps} from "./types/EditCommentItem.types";
import {Database} from "../../../database.types";
import {PostgrestError} from "@supabase/supabase-js";

const EditCommentItem = (props: EditCommentItemProps) => {
    const supabase = useSupabaseClient<Database>();
    const [commentText, setCommentText] = useState(props.initialText);

    async function formSubmitHandler(event: FormEvent) {
        event.preventDefault();

        if (commentText.trim().length === 0) {
            props.triggerAlert("Comment must have 1 or more characters", {
                severity: "warning",
            });
        } else {
            try {
                await supabase
                    .from("comments")
                    .update({text: commentText})
                    .eq("id", props.commentId);
                props.onCommentEdited();
            } catch (error) {
                props.triggerAlert("Failed to edit comment", {
                    severity: "error",
                    error: error as PostgrestError,
                });
            }
        }
    }

    function changeHandler(event: ChangeEvent<HTMLTextAreaElement>) {
        setCommentText(event.target.value);
    }

    return (
        <form onSubmit={formSubmitHandler} className="d-flex flex-column">
            <TextareaAutosize
                aria-label="Edit Comment"
                title="Edit Comment"
                className={styles.inputfield}
                defaultValue={commentText}
                onChange={changeHandler}
                required
            />
            <div className="d-flex gap-1 align-self-end mt-2">
                <Button size="small" type="submit" sx={{color: "gainsboro"}} variant="contained">
                    Update
                </Button>
                <Button size="small" type="button" onClick={props.onCancelEditing} sx={{color: "brown"}}>
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default EditCommentItem;
