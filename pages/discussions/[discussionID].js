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
	const [error, setError] = useState({ occurred: false, text: "" });
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
							setLoading(false);
							setEditAllowed(profileID === data.creator_id);
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
			<div id="discussion-body" className="d-flex flex-column">
				<span className="d-flex gap-1">
					<h2 className={styles.title}>{title}</h2>
					{editAllowed && (
						<IconButton title="Edit" sx={{ color: "whitesmoke" }}>
							<EditIcon />
						</IconButton>
					)}
				</span>
				<div className={styles.creator}>
					Created by <Link href={`/users/${creator}`}>{creator}</Link>
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
	<PageContainer className="d-flex flex-column gap-2" recentItems="discussions">{page}</PageContainer>
);
