import {
	Fragment,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import CommentItem from "./CommentItem";
import CommentBox from "./CommentBox";
import styles from "../Comments-Reviews.module.css";
import { Alert, Snackbar } from "@mui/material";
import { supabase } from "../../../supabase/config";
import { getCommentsData } from "../../../utilities/app-utilities";
import { UserAuthContext } from "../../../context/UserAuthContext";

const defaultSnackbarState = { open: false, severity: "info", text: "" };

const CommentsList = ({ id, className = "" }) => {
	const { profileID } = useContext(UserAuthContext);
	const [commentsData, setCommentsData] = useState([]);
	const [snackbarData, setSnackbarData] = useState(defaultSnackbarState);
	const [replyData, setReplyData] = useState({
		parentCommentID: "",
		accountName: "",
	});

	const triggerAlert = useCallback((text, options) => {
		const alertSeverity = options?.severity;
		setSnackbarData({
			open: true,
			severity: alertSeverity || "info",
			text:
				alertSeverity === "error"
					? `${text} - ${
							options.error.message || options.error.error_description
					  }`
					: text,
		});
	}, []);

	const resetSnackbar = (event, reason) => {
		if (reason === "clickaway") {
			return;
		}
		setSnackbarData(defaultSnackbarState);
	};

	// LOAD COMMENTS ASSOCIATED WITH INSTANCE ID
	useEffect(() => {
		getCommentsData(id)
			.then((data) => {
				setCommentsData(data);
			})
			.catch((error) => {
				triggerAlert("Failed to load comments", { severity: "error", error });
				setCommentsData([]);
			});
	}, [id, triggerAlert]);

	// LISTEN FOR NEW COMMENTS AND UPDATES TO COMMENTS
	useEffect(() => {
		const onCommentAdded = (payload) => {
			const newData = payload.new;
			setCommentsData((snapshot) => {
				snapshot.unshift(newData);
				return [...snapshot];
			});
		};

		const onCommentUpdated = (payload) => {
			const updatedCommentID = payload.new.id;
			setCommentsData((snapshot) => {
				for (let i = 0; i < snapshot.length; ++i) {
					if (snapshot[i].id === updatedCommentID) {
						snapshot[i].text = payload.new.text;
						snapshot[i].upvoted_by = payload.new.upvoted_by;
						return [...snapshot];
					}
				}
				return snapshot;
			});
		};

		const onCommentDeleted = (payload) => {
			const deletedCommentID = payload.old.id;
			setCommentsData((snapshot) => {
				const filteredList = snapshot.filter(
					(commentData) => commentData.id !== deletedCommentID
				);
				return filteredList;
			});
		};

		const channel = supabase
			.channel(`public:comments:instance_id=eq.${id}`)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "comments",
					filter: `instance_id=eq.${id}`,
				},
				onCommentAdded
			)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "comments",
					filter: `instance_id=eq.${id}`,
				},
				onCommentUpdated
			)
			.on(
				"postgres_changes",
				{
					event: "DELETE",
					schema: "public",
					table: "comments",
					filter: `instance_id=eq.${id}`,
				},
				onCommentDeleted
			)
			.subscribe();

		return () => supabase.removeChannel(channel);
	}, [id]);

	const resetReplyData = () => {
		setReplyData({ parentCommentID: "", accountName: "" });
	};

	const replying = replyData.parentCommentID !== "";
	const noComments = commentsData.length === 0;
	const comments = useMemo(() => {
		return commentsData.map((commentData) => {
			return (
				<CommentItem
					key={commentData.id}
					setReplyData={setReplyData}
					commentData={commentData}
					triggerAlert={triggerAlert}
					profileID={profileID}
				/>
			);
		});
	}, [commentsData, triggerAlert, profileID]);

	const alertAnchorOrigin = {
		vertical: "bottom",
		horizontal: "left",
	};
	const componentClassName = `${styles.component} ${className}`;
	return (
		<div className={componentClassName}>
			{profileID && (
				<Fragment>
					<CommentBox
						instanceID={id}
						profileID={profileID}
						replying={replying}
						replyData={replyData}
						cancelReply={resetReplyData}
						onReplyPosted={resetReplyData}
						triggerAlert={triggerAlert}
					/>
				</Fragment>
			)}
			{!noComments && (
				<ul className={styles.items}>
					{comments}
				</ul>
			)}
			{noComments && (
				<div className="d-flex justify-content-center mt-4">No Comments</div>
			)}
			<Snackbar
				open={snackbarData.open}
				autoHideDuration={6000}
				onClose={resetSnackbar}
				anchorOrigin={alertAnchorOrigin}>
				<Alert
					severity={snackbarData.severity}
					sx={{ width: "100%" }}
					onClose={resetSnackbar}>
					{snackbarData.text}
				</Alert>
			</Snackbar>
		</div>
	);
};

export default CommentsList;
