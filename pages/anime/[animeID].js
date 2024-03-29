import BodyLayout from "../../components/BodyLayout/BodyLayout";
import StarIcon from "@mui/icons-material/Star";
import { Box, Chip, Snackbar, Alert } from "@mui/material";
import { Fragment, useCallback, useContext, useEffect, useState } from "react";
import { getAnimeByID } from "../../utilities/mal-api";
import { UserAuthContext } from "../../context/UserAuthContext";
import Select from "../../components/Select/Select";
import {
	defaultSnackbarState,
	getUsefulData,
	getUserItemRecommendations,
	setRecentItem,
	getProfileData,
} from "../../utilities/app-utilities";
import styles from "../../styles/anime.module.css";
import CommentsList from "../../components/Comments-Reviews/Comments/CommentsList";
import ReviewsList from "../../components/Comments-Reviews/Reviews/ReviewsList";
import Loading from "../../components/Loading/Loading";
import AddToList from "../../components/AddToList/AddToList";
import Error from "../../components/Error/Error";
import Head from "next/head";
import { useRouter } from "next/router";
import HeaderLayout from "../../components/HeaderLayout/HeaderLayout";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const ExtraInfo = (props) => {
	return (
		<ul className={styles["extra-info"]}>
			<li>
				<span className={styles.category}>Episodes</span>
				<span className={styles["category-data"]}>{props.episodes}</span>
			</li>
			<li>
				<span className={styles.category}>Studios</span>
				<ul className={styles["category-data"]}>{props.studios}</ul>
			</li>
			<li>
				<span className={styles.category} title="MyAnimeList Ranking">
					MAL Ranking
				</span>
				<span className={styles["category-data"]}>{props.rank}</span>
			</li>
			<li>
				<span className={styles.category}>Status</span>
				<span className={styles["category-data"]}>{props.status}</span>
			</li>
		</ul>
	);
};

const getItemStudio = (itemData) => {
	const studios = [];
	if (itemData["studios"].length === 0) {
		studios.push(<li key={0}>N/A</li>);
		return studios;
	}
	itemData["studios"].forEach((studio, index) => {
		studios.push(<li key={index}>{studio.name}</li>);
	});
	return studios;
};

const transformAnimeData = (data) => {
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

const AnimeDetails = () => {
	const supabase = useSupabaseClient();
	const { profileID } = useContext(UserAuthContext);
	const [snackbarData, setSnackbarData] = useState(defaultSnackbarState);
	const [watchStatus, setWatchStatus] = useState("NOT_WATCHED");
	const [info, setInfo] = useState(null);
	const [extraInfo, setExtraInfo] = useState(null);
	const [recommendationStatus, setRecommendationStatus] =
		useState("not_recommended");
	const [recommendBtnDisabled, setRecommendBtnDisabled] = useState(false);
	const [watchStatusElDisabled, setWatchStatusElDisabled] = useState(false);
	const [categoryVal, setCategoryVal] = useState("COMMENTS");
	const [errorText, setErrorText] = useState("");
	const router = useRouter();
	const animeID = router.query?.animeID;

	// ALLOW SNACKBAR STATE TO BE CUSTOMIZED
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

	// LOAD DATA FOR ITEM AND RENDER IT IN UI
	useEffect(() => {
		if (animeID) {
			setInfo(null);
			getAnimeByID(animeID)
				.then((animeData) => {
					const { main, extra } = transformAnimeData(animeData);
					setInfo(main);
					setExtraInfo(extra);
				})
				.catch((error) => {
					setErrorText(error.message);
				});
		}
	}, [animeID]);

	// IF THERE IS A SIGNED IN USER, CHECK IF ANIME IS RECOMMENDED OR HAS A WATCH STATUS SET
	useEffect(() => {
		if (router.isReady && profileID !== null) {
			const { animeID } = router.query;
			setWatchStatusElDisabled(true);
			setRecommendBtnDisabled(true);
			// LOAD ANIME WATCH STATUS FOR SIGNED IN USER
			getProfileData(supabase, "items_watch_status", profileID)
				.then(({ items_watch_status }) => {
					const animeIDs = Object.keys(items_watch_status);
					if (animeIDs.includes(animeID)) {
						setWatchStatus(items_watch_status[animeID]);
					}
					setWatchStatusElDisabled(false);
				})
				.catch((error) => {
					triggerAlert("Failed to load anime watch status", {
						severity: "error",
						error,
					});
				});

			// CHECK IF ANIME IS RECOMMENDED BY SIGNED IN USER
			getUserItemRecommendations(supabase, profileID)
				.then(({ data: rows }) => {
					const isRecommended = rows.some((row) => row.item_id === animeID);
					if (isRecommended) {
						setRecommendationStatus("recommended");
					} else {
						setRecommendationStatus("not_recommended");
					}
					setRecommendBtnDisabled(false);
				})
				.catch((error) => {
					triggerAlert("Failed to load anime recommendation status", {
						severity: "error",
						error,
					});
				});
		}
	}, [profileID, router, triggerAlert, supabase]);

	// IF THERE IS A SIGNED IN USER AND ANIME HAS BEEN CONFIRMED TO EXIST - UPDATE THEIR RECENTLY VIEWED ANIMES
	useEffect(() => {
		if (router.isReady && profileID !== null && info !== null) {
			const { animeID } = router.query;
			setRecentItem(supabase, "animes", profileID, {
				id: animeID,
				title: info.title,
				photoURL: info.photoURL,
				synopsis: info.overview,
			}).catch((error) => {
				triggerAlert("Error", { severity: "error", error });
			});
		}
	}, [profileID, router, triggerAlert, info, supabase]);

	// RECOMMEND ITEM OR REMOVE RECOMMENDATION
	const recommendItem = async () => {
		if (profileID === null) return;

		setRecommendBtnDisabled(true);
		const { data: rows } = await getUserItemRecommendations(
			supabase,
			profileID
		);
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
				supabase,
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

	const loading = info === null && errorText === "";

	if (errorText.length > 0) {
		return (
			<Fragment>
				<Head>
					<title>Animehaven | Anime</title>
				</Head>
				<Error
					title="Error occurred while loading anime"
					extraText={errorText}
					sx={{ width: "100%" }}
				/>
			</Fragment>
		);
	}

	if (router.isReady === false || loading) {
		return (
			<Fragment>
				<Head>
					<title>Animehaven | Anime</title>
				</Head>
				<Loading />
			</Fragment>
		);
	}

	const alertAnchorOrigin = {
		vertical: "bottom",
		horizontal: "left",
	};
	return (
		<Fragment>
			<Head>
				<title>{`Animehaven | ${info.title}`}</title>
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
								width: "max-content",
							}}
						/>
						<span className="d-flex align-items-center gap-2">
							<StarIcon sx={{ color: "goldenrod", marginBottom: "2px" }} />
							<small>{info.score}</small>
						</span>
						{profileID && (
							<AddToList
								animeID={animeID}
								profileID={profileID}
								itemData={{ id: animeID, title: info.title }}
								triggerAlert={triggerAlert}
							/>
						)}
					</span>
					<p className={styles.overview}>{info.overview}</p>
				</section>
				<Select
					aria-label="Show comments or reviews"
					title="Show comments or reviews"
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
					<img src={info.photoURL} alt={info.title} />
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
		</Fragment>
	);
};

export default AnimeDetails;

AnimeDetails.getLayout = (page) => (
	<HeaderLayout>
		<BodyLayout className={styles.page}>{page}</BodyLayout>
	</HeaderLayout>
);
