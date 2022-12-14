import { Button, IconButton } from "@mui/material";
import { Fragment, useContext, useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import styles from "../../styles/discussion.module.css";
import Loading from "../../components/Loading/Loading";
import Error from "../../components/Error/Error";
import CommentsList from "../../components/Comments-Reviews/Comments/CommentsList";
import PageContainer from "../../components/PageContainer/PageContainer";
import {
	getDiscussionByID,
	getProfileData,
	setRecentItem,
} from "../../utilities/app-utilities";
import { UserAuthContext } from "../../context/UserAuthContext";
import { useRouter } from "next/router";
import EditIcon from "@mui/icons-material/Edit";

const initialErrorState = { occurred: false, text: "" };
const Discussion = () => {
	const router = useRouter();
	const { profileID } = useContext(UserAuthContext);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(initialErrorState);
	const [data, setData] = useState({
		title: null,
		creator: null,
		body: null,
		commentInstanceID: null,
	});
	const [editAllowed, setEditAllowed] = useState(false);
	const discussionID = router.query?.discussionID;

	useEffect(() => {
		if (discussionID) {
			setLoading(true);

			getDiscussionByID(discussionID)
				.then((data) => {
					getProfileData("account_name", data.creator_id).then(
						({ account_name }) => {
							setData({
								title: data.title,
								creator: account_name,
								body: data.body,
								commentInstanceID: data.comment_instance_id,
							});
							setEditAllowed(profileID === data.creator_id);
							setError(initialErrorState);
							setLoading(false);

							// SINCE DISCUSSION HAS BEEN CONFIRMED TO EXIST, ADD IT TO RECENTLY VIEWED DISCUSISONS
							if (profileID !== null) {
								setRecentItem("discussions", profileID, discussionID);
							}
						}
					);
				})
				.catch((error) => {
					setError({
						occurred: true,
						text: error.message || error.error_description,
					});
					setLoading(false);
				});
		}
	}, [discussionID, profileID]);

	if (router.isReady === false || loading) {
		return (
			<Fragment>
				<Head>
					<title>Animehaven | Discussion</title>
				</Head>
				<Loading />
			</Fragment>
		);
	}

	if (error.occurred) {
		return (
			<Fragment>
				<Head>
					<title>Animehaven | Discussion</title>
				</Head>
				<Error
					title="Error occurred while loading discussion"
					extraText={error.text}
				/>
			</Fragment>
		);
	}

	function editButtonClickHandler() {
		router.push(`/discussions/edit?id=${discussionID}`);
	}

	const { title, body, creator, commentInstanceID } = data;
	return (
		<Fragment>
			<Head>
				<title>Animehaven | Discussion - {title}</title>
				<meta name="description" content={body} />
				<meta
					property="og:title"
					content={`Animehaven | Discussion - ${title}`}
				/>
				<meta property="og:description" content={body} />
				<meta
					property="og:url"
					content={`https://animehaven.vercel.app/discussions/${discussionID}`}
				/>
				<meta
					name="twitter:title"
					content={`Animehaven | Discussion - ${title}`}
				/>
				<meta name="twitter:description" content={body} />
			</Head>
			<div id="discussion-body" className="d-flex flex-column">
				<span className={styles.creator}>
					Created by <Link href={`/users/${creator}`}>{creator}</Link>
				</span>
				<div className="d-flex gap-2 align-items-center">
					<h2 className={styles.title}>{title}</h2>
					{editAllowed && (
						<IconButton
							aria-label="Edit discussion"
							title="Edit discussion"
							type="button"
							sx={{ color: "lightblue" }}
							onClick={editButtonClickHandler}>
							<EditIcon />
						</IconButton>
					)}
				</div>
				<p className={styles.body}>{body}</p>
			</div>
			<CommentsList
				className="mt-4"
				id={commentInstanceID}
				profileID={profileID}
			/>
		</Fragment>
	);
};

export default Discussion;

Discussion.getLayout = (page) => (
	<PageContainer
		className={`d-flex flex-column gap-2 ${styles.container}`}
		recentItems="discussions">
		{page}
	</PageContainer>
);
