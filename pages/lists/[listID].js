import { IconButton, Skeleton } from "@mui/material";
import { Fragment, useContext, useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import EditIcon from "@mui/icons-material/Edit";
import styles from "../../styles/list.module.css";
import Loading from "../../components/Loading/Loading";
import CreateList from "../../components/CreateList/CreateList";
import Error from "../../components/Error/Error";
import CommentsList from "../../components/Comments-Reviews/Comments/CommentsList";
import BodyLayout from "../../components/BodyLayout/BodyLayout";
import {
	getListByID,
	getUsefulData,
	setRecentItem,
} from "../../utilities/app-utilities";
import { getAnimeByID } from "../../utilities/mal-api";
import { UserAuthContext } from "../../context/UserAuthContext";
import { useRouter } from "next/router";
import HeaderLayout from "../../components/HeaderLayout/HeaderLayout";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const Item = ({ itemID, itemTitle, index }) => {
	const [loading, setLoading] = useState(true);
	const [itemData, setItemData] = useState({
		title: "",
		overview: "",
		imageURL: "",
	});

	useEffect(() => {
		// LAZY REQEUST DUE TO RATE LIMITING
		const timeout = index > 0 ? index * 500 : 0;
		setTimeout(() => {
			getAnimeByID(itemID)
				.then((data) => {
					const { overview, imageURL } = getUsefulData(data);
					setItemData({
						title: itemTitle,
						overview,
						imageURL,
					});
					setLoading(false);
				})
				.catch((reason) => console.error(reason));
		}, timeout);
	}, [itemID, itemTitle, index]);

	const { title, overview, imageURL } = itemData;
	return (
		<li className={`p-1 d-flex gap-1 ${styles.item}`}>
			{loading && (
				<Fragment>
					<Skeleton variant="rounded" width={100} height={100} />
					<div
						className={`d-flex flex-column justify-content-between flex-grow-1`}>
						<Skeleton sx={{ fontSize: "1rem" }} width={210} />
						<Skeleton variant="rounded" height={70} />
					</div>
				</Fragment>
			)}
			{!loading && (
				<Fragment>
					<img src={imageURL} alt={title} loading="lazy" />
					<div className="d-flex flex-column h-100" style={{ minWidth: "0" }}>
						<Link href={`/anime/${itemID}`} className={styles["item-title"]}>
							{title}
						</Link>
						<p className={styles["item-overview"]} title={overview}>
							{overview}
						</p>
					</div>
				</Fragment>
			)}
		</li>
	);
};

const initialErrorState = { occurred: false, text: "" };
const List = () => {
	const supabase = useSupabaseClient();
	const { listID } = useRouter().query;
	const { profileID } = useContext(UserAuthContext);
	const [loading, setLoading] = useState(true);
	const [showCreateListDialog, setShowCreateListDialog] = useState(false);
	const [listData, setListData] = useState({});
	const [editAllowed, setEditAllowed] = useState(false);
	const [error, setError] = useState(initialErrorState);

	// REQUEST FOR AND LOAD LIST DATA TO UI
	useEffect(() => {
		if (listID === undefined) return;
		getListByID(supabase, listID)
			.then((data) => {
				const {
					title,
					description,
					creator_id,
					items,
					genres,
					is_public,
					comment_instance_id,
				} = data;
				supabase
					.from("profiles")
					.select("account_name")
					.eq("id", creator_id)
					.throwOnError()
					.limit(1)
					.single()
					.then((profileQuery) => {
						const { account_name } = profileQuery.data;
						setListData({
							id: listID,
							title,
							desc: description,
							creator: account_name,
							items,
							genres,
							is_public,
							comment_instance_id,
						});
						setEditAllowed(profileID === creator_id);
						setError(initialErrorState);
						setLoading(false);

						// SINCE LIST EXISTS, ADD TO RECENTLY VIEWED LISTS
						if (profileID !== null) {
							setRecentItem(supabase, "lists", profileID, listID);
						}
					});
			})
			.catch((error) => {
				setError({
					occurred: true,
					text: error.message || error.error_description,
				});
				setLoading(false);
			});
	}, [listID, profileID, supabase]);

	const openCreateListDialog = () => setShowCreateListDialog(true);
	const closeCreateListDialog = () => setShowCreateListDialog(false);

	if (loading) {
		return <Loading />;
	}
	if (error.occurred) {
		return (
			<Error title="Error occurred while loading list" extraText={error.text} />
		);
	}

	const { title, desc, creator, items, comment_instance_id } = listData;
	const transformedItems = items.map((item, index) => (
		<Item key={item.id} itemID={item.id} itemTitle={item.title} index={index} />
	));

	return (
		<Fragment>
			<Head>
				<title>Animehaven | List - {title}</title>
				<meta name="description" content={desc} />
				<meta property="og:title" content={`Animehaven | List - ${title}`} />
				<meta property="og:description" content={desc} />
				<meta
					property="og:url"
					content={`https://animehaven.vercel.app/lists/${listID}`}
				/>
				<meta name="twitter:title" content={`Animehaven | List - ${title}`} />
				<meta name="twitter:description" content={desc} />
			</Head>
			{editAllowed && (
				<CreateList
					open={showCreateListDialog}
					onClose={closeCreateListDialog}
					profileID={profileID}
					update={true}
					defaultValues={listData}
				/>
			)}
			<div id="list-info" className="d-flex flex-column">
				<span className={styles.creator}>
					Created by <Link href={`/users/${creator}`}>{creator}</Link>
				</span>
				<span className="d-flex gap-1">
					<h2 className={styles.title}>{title}</h2>
					{editAllowed && (
						<IconButton
							aria-label="Edit list"
							title="Edit list"
							sx={{ color: "lightblue" }}
							onClick={openCreateListDialog}>
							<EditIcon />
						</IconButton>
					)}
				</span>
				<p className={styles.desc}>{desc}</p>
			</div>
			<ul id="list-items" className={styles.items}>
				{transformedItems}
			</ul>
			<CommentsList
				className="mt-4"
				id={comment_instance_id}
				profileID={profileID}
			/>
		</Fragment>
	);
};

export default List;

List.getLayout = (page) => (
	<Fragment>
		<Head>
			<title>Animehaven | List</title>
		</Head>
		<HeaderLayout>
			<BodyLayout className="d-flex flex-column gap-2" recentItems="lists">
				{page}
			</BodyLayout>
		</HeaderLayout>
	</Fragment>
);
