import { IconButton, Skeleton } from "@mui/material";
import { Fragment, useContext, useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import EditIcon from "@mui/icons-material/Edit";
import styles from "../../styles/list.module.css";
import Loading from "../../components/Loading/Loading";
import Locked from "../../components/Locked/Locked";
import CreateList from "../../components/CreateList/CreateList";
import Error from "../../components/Error/Error";
import CommentsList from "../../components/Comments-Reviews/Comments/CommentsList";
import PageContainer from "../../components/PageContainer/PageContainer";
import { supabase } from "../../supabase/config";
import { getUsefulData } from "../../utilities/app-utilities";
import { getAnimeByID } from "../../utilities/mal-api";
import { UserAuthContext } from "../../context/UserAuthContext";
import { useRouter } from "next/router";
import Image from "next/image";

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
					<Image src={imageURL} alt={title} width={90} height={112} />
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

const List = () => {
	const { listID } = useRouter().query;
	const { profileID } = useContext(UserAuthContext);
	const [title, setTitle] = useState("");
	const [creator, setCreator] = useState("");
	const [desc, setDesc] = useState("");
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [isLocked, setIsLocked] = useState(false);
	const [loadingFailed, setLoadingFailed] = useState(false);
	const [showCreateListDialog, setShowCreateListDialog] = useState(false);
	const [listCurrentValues, setListCurrentValues] = useState({});

	// REQUEST FOR AND LOAD LIST DATA TO UI
	useEffect(() => {
		if (listID === undefined) return;
		supabase
			.from("lists")
			.select()
			.eq("id", listID)
			.throwOnError()
			.limit(1)
			.single()
			.then((response) => {
				const { title, description, creator_id, items, genres, is_public } =
					response.data;
				supabase
					.from("profiles")
					.select("account_name")
					.eq("id", creator_id)
					.throwOnError()
					.limit(1)
					.single()
					.then((profileQuery) => {
						const { account_name } = profileQuery.data;
						setTitle(title);
						setCreator(account_name);
						setDesc(description);
						const transformed = items.map((item, index) => (
							<Item
								key={item.id}
								itemID={item.id}
								itemTitle={item.title}
								index={index}
							/>
						));
						setItems(transformed);
						setListCurrentValues({
							id: listID,
							title,
							desc: description,
							items,
							genres,
							is_public,
						});
						setLoading(false);
					});
			})
			.catch((error) => {
				// error code PGRST116 indicates that the user doesn't have permission to view resource
				if (error.code === "PGRST116") {
					setIsLocked(true);
				} else {
					console.error(error);
				}
				setLoading(false);
				setLoadingFailed(true);
			});
	}, [listID]);

	const openCreateListDialog = () => setShowCreateListDialog(true);
	const closeCreateListDialog = () => setShowCreateListDialog(false);
	const errorOccurred = loadingFailed && !isLocked;
	return (
		<Fragment>
			{loading && <Loading />}
			{errorOccurred && (
				<Error
					title="Error occurred while loading list"
					extraText="Consider reloading the page!"
				/>
			)}
			{isLocked && <Locked />}
			{!loading && !isLocked && (
				<Fragment>
					<Head>
						<title>Animehaven | List - {title}</title>
						<meta name="description" content={desc} />
						<meta
							property="og:title"
							content={`Animehaven | List - ${title}`}
						/>
						<meta property="og:description" content={desc} />
						<meta
							property="og:url"
							content={`https://animehaven.vercel.app/lists/${listID}`}
						/>
						<meta
							name="twitter:title"
							content={`Animehaven | List - ${title}`}
						/>
						<meta name="twitter:description" content={desc} />
					</Head>
					<PageContainer className="d-flex flex-column gap-2">
						{profileID && (
							<CreateList
								open={showCreateListDialog}
								onClose={closeCreateListDialog}
								profileID={profileID}
								update={true}
								defaultValues={listCurrentValues}
							/>
						)}
						<div id="list-info" className="d-flex flex-column">
							<span className="d-flex gap-1">
								<h2 className={styles.title}>{title}</h2>
								{profileID && (
									<IconButton
										title="Edit"
										sx={{ color: "whitesmoke" }}
										onClick={openCreateListDialog}>
										<EditIcon />
									</IconButton>
								)}
							</span>
							<Link className={styles.creator} href={`/users/${creator}`}>
								{creator}
							</Link>
							<p className={styles.desc}>{desc}</p>
						</div>
						<ul id="list-items" className={styles.items}>
							{items}
						</ul>
						<CommentsList id={listID} profileID={profileID} />
					</PageContainer>
				</Fragment>
			)}
		</Fragment>
	);
};

export default List;
