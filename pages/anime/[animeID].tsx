import BodyLayout from "../../components/BodyLayout/BodyLayout";
import StarIcon from "@mui/icons-material/Star";
import { Box, Chip } from "@mui/material";
import React, {
  Fragment,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from "react";
import { getAnimeById } from "../../utilities/mal-api";
import { UserAuthContext } from "../../context/authentication/UserAuthContext";
import Select from "../../components/Select/Select";
import {
  getProfileData,
  getRelevantAnimeData,
  getUserItemRecommendations,
  setRecentItem,
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
import { VALID_WATCH_STATUS } from "../../utilities/global-constants";
import { Database } from "../../database.types";
import { AnimeItemData, WatchStatus } from "../../utilities/global.types";
import { NextPageWithLayout } from "../_app";
import { PostgrestError } from "@supabase/supabase-js";
import { NotificationContext } from "../../context/notifications/NotificationContext";

const AnimeDetails: NextPageWithLayout = () => {
  const supabase = useSupabaseClient<Database>();
  const { profileID } = useContext(UserAuthContext);
  const [watchStatus, setWatchStatus] = useState<WatchStatus>("NOT_WATCHED");
  const [anime, setAnime] = useState<AnimeItemData>();
  const [recommendationStatus, setRecommendationStatus] =
    useState("not_recommended");
  const [recommendBtnDisabled, setRecommendBtnDisabled] = useState(false);
  const [watchStatusElDisabled, setWatchStatusElDisabled] = useState(false);
  const [categoryVal, setCategoryVal] = useState("COMMENTS");
  const [errorText, setErrorText] = useState("");
  const router = useRouter();
  const { showNotification } = useContext(NotificationContext);
  const animeID = router.query?.animeID as string;

  // LOAD DATA FOR ITEM AND RENDER IT IN UI
  useEffect(() => {
    if (animeID) {
      getAnimeById(animeID)
        .then((anime) => {
          setAnime(getRelevantAnimeData(anime));
        })
        .catch((error) => {
          setErrorText(error.message);
        });
    }
  }, [animeID]);

  // IF THERE IS A SIGNED-IN USER, CHECK IF ANIME IS RECOMMENDED OR HAS A WATCH STATUS SET
  useEffect(() => {
    if (router.isReady && profileID !== undefined) {
      const animeID = router.query?.animeID as string;
      setWatchStatusElDisabled(true);
      setRecommendBtnDisabled(true);
      // LOAD ANIME WATCH STATUS FOR SIGNED IN USER
      getProfileData(supabase, profileID)
        .then(({ items_watch_status }) => {
          const animeIDs = Object.keys(items_watch_status);
          if (animeIDs.includes(animeID)) {
            setWatchStatus(items_watch_status[animeID]);
          }
          setWatchStatusElDisabled(false);
        })
        .catch((error) => {
          showNotification("Failed to load anime watch status", {
            severity: "error",
            error,
          });
        });

      // CHECK IF ANIME IS RECOMMENDED BY SIGNED IN USER
      getUserItemRecommendations(supabase, profileID)
        .then(({ data: rows }) => {
          if (rows !== null) {
            const isRecommended = rows.some((row) => row.item_id === animeID);
            if (isRecommended) {
              setRecommendationStatus("recommended");
            } else {
              setRecommendationStatus("not_recommended");
            }
            setRecommendBtnDisabled(false);
          }
        })
        .catch((error) => {
          showNotification("Failed to load anime recommendation status", {
            severity: "error",
            error,
          });
        });
    }
  }, [profileID, router, showNotification, supabase]);

  // IF THERE IS A SIGNED-IN USER AND ANIME HAS BEEN CONFIRMED TO EXIST - UPDATE THEIR RECENTLY VIEWED ANIMES
  useEffect(() => {
    if (router.isReady && profileID !== undefined && anime !== undefined) {
      const animeID = router.query?.animeID as string;
      setRecentItem(supabase, "animes", profileID, {
        id: animeID,
        title: anime.title,
        photoURL: anime.imageURL,
        synopsis: anime.synopsis,
      }).catch((error) => {
        showNotification("Failed to update your recently viewed animes", {
          severity: "error",
          error,
        });
      });
    }
  }, [profileID, router, showNotification, anime]);

  // Update Anime watch status
  useEffect(() => {
    if (!profileID) return;

    if (!VALID_WATCH_STATUS.includes(watchStatus)) {
      return showNotification("Failed to update item watch status", {
        severity: "error",
        error: {
          message: "Invalid watch status",
        },
      });
    }

    setWatchStatusElDisabled(true);
    getProfileData(supabase, profileID)
      .then(({ items_watch_status }) => {
        items_watch_status[animeID] = watchStatus;
        supabase
          .from("profiles")
          .update({ items_watch_status })
          .eq("id", profileID)
          .throwOnError()
          .then((response) => {
            if (response.error) {
            } else {
            }
          });
      })
      .catch((error: PostgrestError) => {
        showNotification("Failed to update item watch status", {
          severity: "error",
          error: error,
        });
      })
      .finally(() => {
        setWatchStatusElDisabled(false);
      });
  }, [watchStatus, profileID]);

  // RECOMMEND ITEM OR REMOVE RECOMMENDATION
  const recommendItem = async () => {
    if (!profileID) return;

    // TODO: Replace this DB query with a row count since we are not using the actual row data
    const { data: rows, error } = await getUserItemRecommendations(
      supabase,
      profileID,
    );
    if (error !== null) {
      return showNotification("Failed to modify anime recommendation", {
        severity: "error",
        error,
      });
    }

    setRecommendBtnDisabled(true);
    const isRecommended = rows.some((row) => row.item_id === animeID);
    if (!isRecommended) {
      try {
        await supabase
          .from("item_recommendations")
          .insert({ item_id: animeID, recommended_by: profileID });
        setRecommendationStatus("recommended");
      } catch (error) {
        showNotification("Failed to recommend item", {
          severity: "error",
          error: error as PostgrestError,
        });
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
        showNotification("Failed to remove recommendation", {
          severity: "error",
          error: error as PostgrestError,
        });
      }
    }
    setRecommendBtnDisabled(false);
  };

  if (errorText !== "") {
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

  const animeDataIsLoaded = anime !== undefined && errorText === "";
  if (!animeDataIsLoaded) {
    return (
      <Fragment>
        <Head>
          <title>Animehaven | Anime</title>
        </Head>
        <Loading />
      </Fragment>
    );
  }

  anime.synopsis = anime.synopsis.replace("[Written by MAL Rewrite]", "");
  return (
    <Fragment>
      <Head>
        <title>{`Animehaven | ${anime.title}`}</title>
        <meta name="description" content={anime.synopsis} />
        <meta property="og:title" content={`Animehaven | ${anime.title}`} />
        <meta property="og:description" content={anime.synopsis} />
        <meta
          property="og:url"
          content={`https://animehaven.vercel.app/item/${animeID}`}
        />
        <meta name="twitter:title" content={`Animehaven | ${anime.title}`} />
        <meta name="twitter:description" content={anime.overview} />
      </Head>
      <Box
        className={`d-flex flex-column mt-5 gap-3 ${styles["main-section-container"]}`}
      >
        <section className={styles.mainSection}>
          <h2 className={styles.name}>{anime.title}</h2>
          <span className="d-flex gap-3">
            <Chip
              label={anime.type}
              sx={{
                color: "white",
                backgroundColor: "#616161",
                width: "max-content",
              }}
            />
            <span className="d-flex align-items-center gap-2">
              <StarIcon sx={{ color: "goldenrod", marginBottom: "2px" }} />
              <small>{anime.score}</small>
            </span>
            {profileID && (
              <AddToList
                profileID={profileID}
                itemData={{ id: +animeID, title: anime.title }}
              />
            )}
          </span>
          <p className={styles.overview}>{anime.synopsis}</p>
        </section>
        <Select
          aria-label="Show comments or reviews"
          title="Show comments or reviews"
          value={categoryVal}
          onChange={(e) => setCategoryVal(e.target.value)}
        >
          <option value="COMMENTS">Comments</option>
          <option value="REVIEWS">Reviews</option>
        </Select>
        {categoryVal === "COMMENTS" && <CommentsList id={animeID} />}
        {categoryVal === "REVIEWS" && (
          <ReviewsList
            profileID={profileID}
            animeID={animeID}
            showNotification={showNotification}
          />
        )}
      </Box>
      <div className="d-flex flex-column gap-1 align-items-center">
        <span className={styles.photo}>
          <img src={anime.imageURL} alt={anime.title} />
        </span>
        {profileID && (
          <span className="d-flex gap-2">
            <select
              className={styles.watchStatus}
              onChange={(e) => {
                if (VALID_WATCH_STATUS.includes(e.target.value)) {
                  setWatchStatus(e.target.value as WatchStatus);
                }
              }}
              value={watchStatus}
              disabled={watchStatusElDisabled}
            >
              <option value="NOT_WATCHED">Not watched</option>
              <option value="WATCHING">Watching</option>
              <option value="WATCHED">Watched</option>
            </select>
            <button
              type="button"
              className={`${styles.btn} ${styles[recommendationStatus]}`}
              onClick={recommendItem}
              style={{ borderColor: "#F8E378" }}
              disabled={recommendBtnDisabled}
            >
              {recommendationStatus === "recommended"
                ? "Recommended"
                : "Recommend"}
            </button>
          </span>
        )}
        <ul className={styles["extra-info"]}>
          <li>
            <span className={styles.category}>Episodes</span>
            <span className={styles["category-data"]}>{anime.episodes}</span>
          </li>
          <li>
            <span className={styles.category}>Studios</span>
            <ul className={styles["category-data"]}>
              {anime.studios.length === 0
                ? [<li key={0}>N/A</li>]
                : anime.studios.map((studio) => (
                    <li key={studio.mal_id}>{studio.name}</li>
                  ))}
            </ul>
          </li>
          <li>
            <span className={styles.category} title="MyAnimeList Ranking">
              MAL Ranking
            </span>
            <span className={styles["category-data"]}>{anime.rank}</span>
          </li>
          <li>
            <span className={styles.category}>Status</span>
            <span className={styles["category-data"]}>{anime.status}</span>
          </li>
        </ul>
      </div>
    </Fragment>
  );
};

export default AnimeDetails;

AnimeDetails.getLayout = (page: ReactElement) => (
  <HeaderLayout>
    <BodyLayout className={styles.page}>{page}</BodyLayout>
  </HeaderLayout>
);
