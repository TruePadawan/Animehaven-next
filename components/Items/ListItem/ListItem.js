import { Fragment, useContext, useEffect, useState } from "react";
import styles from "./style.module.css";
import Link from "next/link";
import { UserAuthContext } from "../../../context/UserAuthContext";
import { supabase } from "../../../supabase/config";
import { Alert, Button, Skeleton, Snackbar } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { getProfileData } from "../../../utilities/app-utilities";

export default function ListItem({ listID, skeleton = false }) {
	const { profileID } = useContext(UserAuthContext);
	const [loading, setLoading] = useState(true);
	const [listTitle, setListTitle] = useState("");
	const [listDesc, setListDesc] = useState("");
	const [creator, setCreator] = useState("");
	const [creatorID, setCreatorID] = useState("");
	const [saveDisabled, setSaveDisabled] = useState(true);
	const [undoSaveDisabled, setUndoSaveDisabled] = useState(true);
	const [snackbarData, setSnackbarData] = useState({
		open: false,
		severity: "success",
		info: "",
	});
	const [isSaved, setIsSaved] = useState(false);

	useEffect(() => {
		if (listID === undefined) {
			return;
		}
		supabase
			.from("lists")
			.select()
			.eq("id", listID)
			.throwOnError()
			.limit(1)
			.single()
			.then((dbQueryResult) => {
				const { title, description, creator_id } = dbQueryResult.data;
				setListTitle(title);
				setListDesc(description);
				setCreatorID(creator_id);
				getProfileData("account_name", creator_id).then(({ account_name }) => {
					setCreator(account_name);
					setLoading(false);
				});
				// ENABLE SAVE BTN IF LIST WAS NOT CREATED BY SIGNED IN USER AND IT ISN'T ALREADY SAVED
				if (profileID === null) {
					setSaveDisabled(true);
				} else {
					getProfileData("saved_lists", profileID).then(({ saved_lists }) => {
						if (
							creator_id !== profileID &&
							saved_lists.includes(listID) === false
						) {
							setIsSaved(false);
							setSaveDisabled(false);
						} else if (
							creator_id !== profileID &&
							saved_lists.includes(listID) === true
						) {
							setIsSaved(true);
							setUndoSaveDisabled(false);
						}
					});
				}
			});
	}, [listID, profileID]);

	const saveList = async () => {
		if (profileID !== null && creatorID !== profileID) {
			setSaveDisabled(true);
			try {
				const { saved_lists } = await getProfileData("saved_lists", profileID);
				if (saved_lists.includes(listID) === false) {
					saved_lists.push(listID);
					await supabase
						.from("profiles")
						.update({ saved_lists })
						.eq("id", profileID)
						.throwOnError();

					setIsSaved(true);
					setSaveDisabled(false);
					setUndoSaveDisabled(false);
					setSnackbarData({
						open: true,
						severity: "success",
						info: "List saved successfully",
					});
				} else {
					setSnackbarData({
						open: true,
						severity: "error",
						info: "Error while saving list - list is already saved",
					});
				}
			} catch (error) {
				setSnackbarData({
					open: true,
					severity: "error",
					info: `Error saving list - ${
						error.message || error.error_description
					}`,
				});
				setSaveDisabled(false);
			}
		}
	};

	const undoSave = async () => {
		if (profileID !== null && creatorID !== profileID) {
			setUndoSaveDisabled(true);
			try {
				let { saved_lists } = await getProfileData("saved_lists", profileID);
				if (saved_lists.includes(listID)) {
					saved_lists = saved_lists.filter((id) => id !== listID);
					await supabase
						.from("profiles")
						.update({ saved_lists })
						.eq("id", profileID)
						.throwOnError();

					setIsSaved(false);
					setSaveDisabled(false);
					setUndoSaveDisabled(false);
					setSnackbarData({
						open: true,
						severity: "success",
						info: "List removed",
					});
				} else {
					setSnackbarData({
						open: true,
						severity: "error",
						info: "Error while removing list - list isn't saved",
					});
				}
			} catch (error) {
				setSnackbarData({
					open: true,
					severity: "error",
					info: `Error while removing list - ${
						error.message || error.error_description
					}`,
				});
				setUndoSaveDisabled(false);
			}
		}
	};

	const closeSnackbar = (e, reason) => {
		if (reason === "clickaway") {
			return;
		}
		setSnackbarData((snapshot) => {
			return { ...snapshot, open: false };
		});
	};

	const saveBtnStyle = {
		color: "#ad6837ec",
		fontFamily: "'Radio Canada', sans-serif",
		"&:hover": {
			color: "#995c31",
		},
	};

	return (
		<Fragment>
			<Snackbar
				open={snackbarData.open}
				onClose={closeSnackbar}
				autoHideDuration={4500}>
				<Alert onClose={closeSnackbar} severity={snackbarData.severity}>
					{snackbarData.info}
				</Alert>
			</Snackbar>
			{!loading && (
				<div className={styles["list-item"]}>
					<div className="d-flex justify-content-between align-items-start">
						<div className="d-flex flex-column">
							<Link className={styles.title} href={`/lists/${listID}`}>
								{listTitle}
							</Link>
							<Link className={styles.creator} href={`/users/${creator}`}>
								{creator}
							</Link>
						</div>
						{!isSaved && (
							<Button
								type="button"
								onClick={saveList}
								startIcon={<ContentCopyIcon />}
								sx={saveBtnStyle}
								disabled={saveDisabled}>
								Save
							</Button>
						)}
						{isSaved && (
							<Button
								type="button"
								onClick={undoSave}
								startIcon={<ContentCopyIcon />}
								sx={saveBtnStyle}
								disabled={undoSaveDisabled}>
								Saved
							</Button>
						)}
					</div>
					{listDesc !== "" && <div className={styles.desc}>{listDesc}</div>}
				</div>
			)}

			{(loading || skeleton) && (
				<div className={styles["list-item"]}>
					<Skeleton variant="text" />
					<Skeleton variant="text" sx={{ fontSize: "0.8rem" }} />
					<Skeleton variant="rectangular" />
				</div>
			)}
		</Fragment>
	);
}
