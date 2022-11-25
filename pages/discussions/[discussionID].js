import { IconButton } from "@mui/material";
import { Fragment, useContext, useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import EditIcon from "@mui/icons-material/Edit";
import styles from "../../styles/discussion.module.css";
import Loading from "../../components/Loading/Loading";
import Error from "../../components/Error/Error";
import CommentsList from "../../components/Comments-Reviews/Comments/CommentsList";
import PageContainer from "../../components/PageContainer/PageContainer";
import {
	getDiscussionByID,
	getProfileData,
} from "../../utilities/app-utilities";
import { UserAuthContext } from "../../context/UserAuthContext";
import { useRouter } from "next/router";

const Discussion = () => {
	const router = useRouter();
	const { profileID } = useContext(UserAuthContext);
	const [loading, setLoading] = useState(false);
	const [errorOccurred, setErrorOccurred] = useState(false);
	const [data, setData] = useState({
		title: null,
		creator: null,
		body: null,
		commentInstanceID: null,
	});
	const [editAllowed, setEditAllowed] = useState(false);

	useEffect(() => {
		if (router.isReady) {
			const { discussionID } = router.query;
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
						}
					);
				})
				.catch(() => {
					setErrorOccurred(true);
				})
				.finally(() => {
					setLoading(false);
				});
		}
	}, [router, profileID]);

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

	if (errorOccurred) {
		return (
			<Fragment>
				<Head>
					<title>Animehaven | Discussion</title>
				</Head>
				<Error
					title="Error occurred while loading discussion"
					extraText="Consider reloading the page!"
				/>
			</Fragment>
		);
	}

	const { title, body, creator, commentInstanceID } = data;
	const { discussionID } = router.query;
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
			<PageContainer className="d-flex flex-column gap-2">
				<div id="discussion-body" className="d-flex flex-column">
					<span className="d-flex gap-1">
						<h2 className={styles.title}>{title}</h2>
						{editAllowed && (
							<IconButton title="Edit" sx={{ color: "whitesmoke" }}>
								<EditIcon />
							</IconButton>
						)}
					</span>
					<Link className={styles.creator} href={`/users/${creator}`}>
						{creator}
					</Link>
					<p className={styles.body}>{body}</p>
				</div>
				<CommentsList
					className="mt-4"
					id={commentInstanceID}
					profileID={profileID}
				/>
			</PageContainer>
		</Fragment>
	);
};

export default Discussion;
