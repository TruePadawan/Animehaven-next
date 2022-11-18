import PageContainer from "../../components/PageContainer/PageContainer";
import starIcon from "../../assets/star.png";
import { Box, Chip, Snackbar, Alert } from "@mui/material";
import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { getAnimeByID } from "../../utilities/mal-api";
import { UserAuthContext } from "../../context/UserAuthContext";
import Select from "../../components/Select/Select";
import {
	getUsefulData,
	getUserItemRecommendations,
} from "../../utilities/app-utilities";
import styles from "../../styles/anime.module.css";
import CommentsList from "../../components/Comments-Reviews/Comments/CommentsList";
import ReviewsList from "../../components/Comments-Reviews/Reviews/ReviewsList";
import Loading from "../../components/Loading/Loading";
import AddToList from "../../components/AddToList/AddToList";
import Error from "../../components/Error/Error";
import { getProfileData } from "../../utilities/app-utilities";
import Head from "next/head";
import { supabase } from "../../supabase/config";
import Image from "next/image";

const ExtraInfo = (props) => {
	return (
		<ul className={styles.extrainfo}>
			<li className="d-flex flex-column">
				<span className={`align-start ${styles.category}`}>Episodes</span>
				<span className="font-bold align-self-center">{props.episodes}</span>
			</li>
			<li className="d-flex flex-column">
				<span className={`align-start ${styles.category}`}>Studios</span>
				<span className="font-bold align-self-center">{props.studios}</span>
			</li>
			<li className="d-flex flex-column">
				<span
					className={`align-start ${styles.category}`}
					title="MyAnimeList Ranking">
					MAL Ranking
				</span>
				<span className="font-bold align-self-center">{props.rank}</span>
			</li>
			<li className="d-flex flex-column">
				<span className={`align-start ${styles.category}`}>Status</span>
				<span className="font-bold align-self-center">{props.status}</span>
			</li>
		</ul>
	);
};

const getItemStudio = (itemData) => {
	let studios = itemData["studios"].length > 0 ? "" : "N/A";
	itemData["studios"].forEach((studio, index) => {
		if (index === itemData["studios"].length - 1) {
			studios = studios.concat(`${studio.name}`);
		} else {
			studios = studios.concat(`${studio.name}, `);
		}
	});
	return studios;
};

const compileItemInfo = (data) => {
	let { title, imageURL, type, score, overview } = getUsefulData(data);
	// REMOVE 'WRITTEN BY MAL REWRITE' TEXT AT THE END OF THE SYNOPSIS
	if (overview) {
		overview = overview.replace(" [Written by MAL Rewrite]", "");
	}
	let studios = getItemStudio(data);

	return {
		main: {
			title,
			type: type || "N/A",
			overview,
			score: score || "N/A",
			photoURL: imageURL,
		},
		extra: {
			episodes: data["episodes"] || "N/A",
			studios,
			rank: data["rank"] || "N/A",
			status: data["status"] || "N/A",
		},
	};
};

const defaultSnackbarState = { open: false, severity: "info", text: "" };

const AnimeDetails = ({ animeID }) => {
	const { profileID } = useContext(UserAuthContext);
	const [loading, setLoading] = useState(true);
	const [snackbarData, setSnackbarData] = useState(defaultSnackbarState);
	const [watchStatus, setWatchStatus] = useState("NOT_WATCHED");
	const [info, setInfo] = useState({
		title: "",
		type: "",
		overview: "",
		score: "",
		photoURL: "",
	});
	const [extraInfo, setExtraInfo] = useState({
		episodes: "",
		studios: "",
		rank: "",
		status: "",
	});
	const [recommendationStatus, setRecommendationStatus] =
		useState("not_recommended");
	const [recommendBtnDisabled, setRecommendBtnDisabled] = useState(false);
	const [watchStatusElDisabled, setWatchStatusElDisabled] = useState(false);
	const [categoryVal, setCategoryVal] = useState("COMMENTS");
	const [loadingFailed, setLoadingFailed] = useState(false);

	// ALLOW SNACKBAR STATE TO BE CUSTOMIZED
	const triggerAlert = useCallback((text, options) => {
		console.log(options.error)
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

	// LOAD DATA FOR ITEM AND RENDER IT IN UI
	useEffect(() => {
		const loadItem = async () => {
			try {
				const animeData = await getAnimeByID(animeID);
				const itemInfo = compileItemInfo(animeData);
				setInfo(itemInfo.main);
				setExtraInfo(itemInfo.extra);
			} catch (error) {
				triggerAlert("Failed to load anime info", { severity: "error", error });
				setLoading(false);
				setLoadingFailed(true);
				return;
			}

			if (profileID && !loadingFailed) {
				setWatchStatusElDisabled(true);
				setRecommendBtnDisabled(true);
				// LOAD ITEM WATCH STATUS
				try {
					const { items_watch_status } = await getProfileData(
						"items_watch_status",
						profileID
					);
					const itemIDs = Object.keys(items_watch_status);
					if (itemIDs.includes(animeID) === false) {
						items_watch_status[animeID] = "NOT_WATCHED";
						await supabase
							.from("profiles")
							.update({ items_watch_status: items_watch_status })
							.eq("id", profileID);
					} else {
						setWatchStatus(items_watch_status[animeID]);
					}
					setWatchStatusElDisabled(false);
				} catch (error) {
					triggerAlert("Failed to load anime watch status", {
						severity: "error",
						error,
					});
					return;
				}

				// CHECK IF ITEM IS RECOMMENDED
				try {
					const { data: rows } = await getUserItemRecommendations(profileID);
					const isRecommended = rows.some((row) => row.item_id === animeID);
					if (isRecommended) {
						setRecommendationStatus("recommended");
					} else {
						setRecommendationStatus("not_recommended");
					}
					setRecommendBtnDisabled(false);
				} catch (error) {
					triggerAlert("Failed to load anime recommendation status", {
						severity: "error",
						error,
					});
					return;
				}
			}
			setLoading(false);
		};
		loadItem();
	}, [profileID, animeID, loadingFailed, triggerAlert]);

	// RECOMMEND ITEM OR REMOVE RECOMMENDATION
	const recommendItem = async () => {
		if (profileID === null) return;

		setRecommendBtnDisabled(true);
		const { data: rows } = await getUserItemRecommendations(profileID);
		const isRecommended = rows.some((row) => row.item_id === animeID);
		if (!isRecommended) {
			try {
				await supabase
					.from("item_recommendations")
					.insert({ item_id: animeID, recommended_by: profileID });
				setRecommendationStatus("recommended");
			} catch (error) {
				triggerAlert("Failed to recommend item", { severity: "error", error });
			}
		} else {
			try {
				await supabase
					.from("item_recommendations")
					.delete()
					.eq("item_id", animeID)
					.eq("recommended_by", profileID)
					.throwOnError();
				setRecommendationStatus("not_recommended");
			} catch (error) {
				triggerAlert("Failed to remove recommendation", {
					severity: "error",
					error,
				});
			}
		}
		setRecommendBtnDisabled(false);
	};

	const updateWatchStatus = async (e) => {
		if (profileID === null) return;

		const newWatchStatus = e.target.value;
		setWatchStatusElDisabled(true);
		try {
			const { items_watch_status } = await getProfileData(
				"items_watch_status",
				profileID
			);
			items_watch_status[animeID] = newWatchStatus;
			await supabase
				.from("profiles")
				.update({ items_watch_status })
				.eq("id", profileID)
				.throwOnError();
			setWatchStatus(newWatchStatus);
		} catch (error) {
			triggerAlert("Failed to update item watch status", {
				severity: "error",
				error,
			});
		}
		setWatchStatusElDisabled(false);
	};

	const errorWhileLoading = loadingFailed === true;
	const loadingSuccessful = loading === false && loadingFailed === false;

	const alertAnchorOrigin = {
		vertical: "bottom",
		horizontal: "left",
	};

	const itemData = {
		id: animeID,
		title: info.title,
	};

	return (
		<Fragment>
			{loading && <Loading />}
			{errorWhileLoading && (
				<Error
					title="Error occurred while loading item"
					extraText="Consider reloading the page!"
				/>
			)}
			{loadingSuccessful && (
				<PageContainer className={styles.page}>
					<Head>
						<title>Animehaven | {info.title}</title>
						<meta name="description" content={info.overview} />
						<meta property="og:title" content={`Animehaven | ${info.title}`} />
						<meta property="og:description" content={info.overview} />
						<meta
							property="og:url"
							content={`https://animehaven.vercel.app/item/${animeID}`}
						/>
						<meta name="twitter:title" content={`Animehaven | ${info.title}`} />
						<meta name="twitter:description" content={info.overview} />
					</Head>
					<Box
						className={`d-flex flex-column mt-5 gap-3 ${styles["main-section-container"]}`}>
						<section className={styles.mainSection}>
							<h2 className={styles.name}>{info.title}</h2>
							<span className="d-flex gap-3">
								<Chip
									label={info.type}
									sx={{
										color: "white",
										backgroundColor: "#616161",
										fontWeight: "bold",
										width: "60px",
									}}
								/>
								<span className={styles.score}>
									<img src={starIcon.src} alt="star" />
									<small>{info.score}</small>
								</span>
								{profileID && (
									<AddToList
										animeID={animeID}
										profileID={profileID}
										itemData={itemData}
										triggerAlert={triggerAlert}
									/>
								)}
							</span>
							<p className={styles.overview}>{info.overview}</p>
						</section>
						<Select
							aria-label="category"
							value={categoryVal}
							onChange={(e) => setCategoryVal(e.target.value)}>
							<option value="COMMENTS" defaultValue>
								Comments
							</option>
							<option value="REVIEWS">Reviews</option>
						</Select>
						{categoryVal === "COMMENTS" && <CommentsList id={animeID} />}
						{categoryVal === "REVIEWS" && (
							<ReviewsList
								profileID={profileID}
								animeID={animeID}
								triggerAlert={triggerAlert}
							/>
						)}
					</Box>
					<div className="d-flex flex-column gap-1 align-items-center">
						<span className={styles.photo}>
							<Image src={info.photoURL} alt={info.title} width={200} height={300} />
						</span>
						{profileID && (
							<span className="d-flex gap-2">
								<select
									className={styles.watchStatus}
									onChange={updateWatchStatus}
									value={watchStatus}
									disabled={watchStatusElDisabled}>
									<option value="NOT_WATCHED">Not watched</option>
									<option value="WATCHING">Watching</option>
									<option value="WATCHED">Watched</option>
								</select>
								<button
									type="button"
									className={`${styles.btn} ${styles[recommendationStatus]}`}
									onClick={recommendItem}
									style={{ borderColor: "#F8E378" }}
									disabled={recommendBtnDisabled}>
									{recommendationStatus === "recommended"
										? "Recommended"
										: "Recommend"}
								</button>
							</span>
						)}
						<ExtraInfo {...extraInfo} />
					</div>
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
				</PageContainer>
			)}
		</Fragment>
	);
};

export function getServerSideProps(context) {
	return {
		props: {
			animeID: context.params.animeID,
		},
	};
}

export default AnimeDetails;
