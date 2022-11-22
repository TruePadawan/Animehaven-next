import { Alert, Button } from "@mui/material";
import Head from "next/head";
import { Fragment, useContext } from "react";
import Input from "../../components/Input/Input";
import TextArea from "../../components/Input/TextArea";
import { UserAuthContext } from "../../context/UserAuthContext";
import styles from "../../styles/create-discussion.module.css";

export default function Create() {
	const { profileID } = useContext(UserAuthContext);

	function formSubmitHandler(event) {
		event.preventDefault();
		if (profileID === null) {
			throw new Error("No user signed in!");
		}
	}

	const noUser = profileID === null;
	return (
		<Fragment>
			<Head>
				<title>Animehaven | Create a Discussion</title>
			</Head>
			<div className={styles["create-discussion-container"]}>
				{noUser && (
					<Alert severity="warning">
						You need to be signed in to create a discussion!
					</Alert>
				)}
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
							minLength={5}
							required
						/>
					</div>
					<div className="d-flex flex-column">
						<label htmlFor="body-field" className={styles.label}>
							Body
						</label>
						<TextArea minRows={6} id="body-field" required />
					</div>
					<div className="d-flex gap-2 align-self-end">
						<Button
							variant="contained"
							className={styles["create-btn"]}
							type="submit"
							disabled={noUser}>
							Create
						</Button>
						<Button type="button" color="error">
							Cancel
						</Button>
					</div>
				</form>
			</div>
		</Fragment>
	);
}
