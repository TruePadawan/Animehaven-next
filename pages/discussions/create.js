import { Alert, Button } from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import { Fragment, useContext, useEffect, useState } from "react";
import Input from "../../components/Input/Input";
import TextArea from "../../components/Input/TextArea";
import Select from "../../components/Select/Select";
import { UserAuthContext } from "../../context/UserAuthContext";
import { DISCUSSION_TAGS } from "../../utilities/app-utilities";
import styles from "../../styles/create-discussion.module.css";
import { supabase } from "../../supabase/config";

const allowed_tags = DISCUSSION_TAGS.map((tag) => tag.toLowerCase());
export default function Create() {
	const { profileID } = useContext(UserAuthContext);
	const [errorText, setErrorText] = useState("");
	const [createBtnDisabled, setCreateBtnDisabled] = useState(false);
	const [discussionData, setDiscussionData] = useState({
		title: "",
		body: "",
		tag: "",
	});
	const router = useRouter();

	useEffect(() => {
		const cachedTitle = window.localStorage.getItem("discussion_title");
		const cachedBody = window.localStorage.getItem("discussion_body");
		setDiscussionData({
			title: cachedTitle || "",
			body: cachedBody || "",
			tag: DISCUSSION_TAGS[0].toLowerCase(),
		});
	}, []);

	useEffect(() => {
		if (profileID === null) {
			setCreateBtnDisabled(true);
			setErrorText("You need to be signed in to create a discussion!");
		} else {
			setCreateBtnDisabled(false);
			setErrorText("");
		}
	}, [profileID]);

	function onDiscussionCreated() {
		window.localStorage.removeItem("discussion_title");
		window.localStorage.removeItem("discussion_body");
		router.push("/discussions");
	}

	async function formSubmitHandler(event) {
		event.preventDefault();

		if (profileID !== null) {
			setCreateBtnDisabled(true);
			const data = discussionData;
			data.creator_id = profileID;
			try {
				if (allowed_tags.includes(data.tag) === false) {
					throw new Error("Invalid tag specified!");
				}
				await supabase.from("discussions").insert(data).throwOnError();
				onDiscussionCreated();
			} catch (error) {
				setErrorText(
					`Failed to create discussion - ${
						error.message || error.error_description
					}`
				);
			}
			setCreateBtnDisabled(false);
		}
	}

	function onCancelBtnClicked() {
		const { title, body } = discussionData;
		const titleTrimmed = title.trim();
		const bodyTrimmed = body.trim();

		if (titleTrimmed.length > 0) {
			window.localStorage.setItem("discussion_title", titleTrimmed);
		}
		if (bodyTrimmed.length > 0) {
			window.localStorage.setItem("discussion_body", bodyTrimmed);
		}

		router.push("/discussions");
	}

	function onTitleInputValueChanged(event) {
		setDiscussionData((snapshot) => {
			return { ...snapshot, title: event.target.value };
		});
	}

	function onBodyInputValueChanged(event) {
		setDiscussionData((snapshot) => {
			return { ...snapshot, body: event.target.value };
		});
	}

	function onSelectChanged(event) {
		setDiscussionData((snapshot) => {
			return { ...snapshot, tag: event.target.value };
		});
	}

	return (
		<Fragment>
			<Head>
				<title>Animehaven | Create a Discussion</title>
			</Head>
			<div className={styles["create-discussion-container"]}>
				{errorText.length > 0 && <Alert severity="warning">{errorText}</Alert>}
				<h2 className="fs-3 mt-3">Create a Discussion</h2>
				<form onSubmit={formSubmitHandler} className="d-flex flex-column gap-2">
					<div className="d-flex flex-column">
						<label htmlFor="title-field" className={styles.label}>
							Title
						</label>
						<Input
							className={styles["title-field"]}
							spellCheck="false"
							id="title-field"
							minLength={4}
							value={discussionData.title}
							onChange={onTitleInputValueChanged}
							required
						/>
					</div>
					<div className="d-flex flex-column">
						<label htmlFor="body-field" className={styles.label}>
							Body
						</label>
						<TextArea
							minRows={6}
							id="body-field"
							value={discussionData.body}
							onChange={onBodyInputValueChanged}
							required
						/>
					</div>
					<div className="d-flex flex-column gap-1">
						<span className={styles.label}>Tags</span>
						<Select value={discussionData.tag} onChange={onSelectChanged}>
							{DISCUSSION_TAGS.map((tag, index) => {
								return (
									<option key={index} value={tag.toLowerCase()}>
										{tag}
									</option>
								);
							})}
						</Select>
					</div>
					<div className="mt-2 d-flex flex-column gap-2">
						<Button
							variant="contained"
							className={styles["create-btn"]}
							type="submit"
							disabled={createBtnDisabled}>
							Create
						</Button>
						<Button type="button" color="warning" onClick={onCancelBtnClicked}>
							Cancel
						</Button>
					</div>
				</form>
			</div>
		</Fragment>
	);
}
