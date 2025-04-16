import BodyLayout from "../components/BodyLayout/BodyLayout";
import {
  Fragment,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import SearchBar from "../components/SearchBar/SearchBar";
import AnimeSearchResultItem from "../components/Items/AnimeSearchResultItem/AnimeSearchResultItem";
import UserSearchResultItem from "../components/Items/UserSearchResultItem/UserSearchResultItem";
import Loading from "../components/Loading/Loading";
import { searchAnime } from "../utilities/mal-api";
import { Alert, Box, Snackbar, SnackbarOrigin } from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  getErrorMessage,
  getRelevantAnimeData,
} from "../utilities/app-utilities";
import HeaderLayout from "../components/HeaderLayout/HeaderLayout";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { DEFAULT_SNACKBAR_STATE } from "../utilities/global-constants";
import { Database, Tables } from "../database.types";
import { Anime } from "@tutkli/jikan-ts";
import { ResetAlert, TriggerAlert } from "../utilities/global.types";
import { PostgrestError } from "@supabase/supabase-js";

export default function Search() {
  const supabase = useSupabaseClient<Database>();
  const [animeSearchResult, setAnimeSearchResult] = useState<Anime[]>([]);
  const [userSearchResult, setUserSearchResult] = useState<
    Tables<"profiles">[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [snackbarData, setSnackbarData] = useState(DEFAULT_SNACKBAR_STATE);
  const searchCategories = useMemo(() => ["Anime", "User"], []);
  const router = useRouter();
  const queryParams = router.query;
  const searchText = queryParams.text;
  const searchCategory = queryParams.cat;

  const searchFunc = useCallback(
    async (searchText: string, searchCategory: string) => {
      setLoading(true);
      if (searchCategory === "ANIME") {
        try {
          const animes = await searchAnime(searchText);
          setAnimeSearchResult(animes);
        } catch (error) {
          triggerAlert("Search failed!", {
            severity: "error",
            error: error as PostgrestError,
          });
        }
      } else if (searchCategory === "USER") {
        const result = await supabase.rpc("search_user", {
          phrase: searchText,
        });
        if (result.error !== null) {
          triggerAlert("Search failed!", { severity: "error" });
        } else {
          // @ts-ignore, fix for wrong type set by Supabase
          setUserSearchResult(result.data);
        }
      }
      setLoading(false);
    },
    [],
  );

  // LOOK FOR SEARCH PARAMS IN PAGE URL
  useEffect(() => {
    if (typeof searchText === "string" && typeof searchCategory === "string") {
      searchFunc(searchText, searchCategory.toUpperCase());
    }
  }, [searchText, searchCategory, searchFunc]);

  const triggerAlert: TriggerAlert = (text, options) => {
    const alertSeverity = options?.severity || "info";
    const alertText =
      alertSeverity === "error"
        ? `${text} - ${getErrorMessage(options?.error)}`
        : text;
    setSnackbarData({ text: alertText, open: true, severity: alertSeverity });
  };

  const resetAlert: ResetAlert = (e, reason) => {
    if (reason !== "clickaway") {
      setSnackbarData(DEFAULT_SNACKBAR_STATE);
    }
  };

  const alertAnchorOrigin: SnackbarOrigin = {
    vertical: "top",
    horizontal: "center",
  };
  return (
    <Fragment>
      <Head>
        <title>Animehaven | Search</title>
        <meta name="description" content="Search for the latest animes." />
        <meta property="og:title" content="Animehaven | Search" />
        <meta
          property="og:description"
          content="Search for the latest animes."
        />
        <meta
          property="og:url"
          content="https://animehaven.vercel.app/search"
        />
        <meta name="twitter:title" content="Animehaven | Search" />
        <meta
          name="twitter:description"
          content="Search for the latest animes."
        />
      </Head>
      <Box
        className="pt-2 d-flex flex-column align-items-center"
        sx={{ maxWidth: "900px", margin: "0 auto" }}
      >
        <SearchBar
          searchCategories={searchCategories}
          searchText={typeof searchText === "string" ? searchText : ""}
          searchCategory={
            typeof searchCategory === "string" ? searchCategory : "Anime"
          }
        />
        {loading && <Loading sx={{ paddingTop: "1rem" }} />}
        {!loading && (
          <ul className="d-flex flex-wrap gap-2 py-2 align-self-start">
            {searchCategory?.toString().toUpperCase() === "ANIME" &&
              animeSearchResult.map((anime) => {
                const { id, title, imageURL } = getRelevantAnimeData(anime);
                return (
                  <AnimeSearchResultItem
                    key={id}
                    linkTo={`/anime/${id}`}
                    title={title}
                    photoURL={imageURL}
                  />
                );
              })}
            {searchCategory?.toString().toUpperCase() === "USER" &&
              userSearchResult.map((user) => {
                const { account_name, display_name, created_at, avatar_url } =
                  user;
                return (
                  <UserSearchResultItem
                    key={account_name}
                    accountName={account_name}
                    title={display_name}
                    avatarURL={avatar_url}
                    timestamp={created_at}
                  />
                );
              })}
          </ul>
        )}
      </Box>
      <Snackbar
        open={snackbarData.open}
        autoHideDuration={5000}
        anchorOrigin={alertAnchorOrigin}
        onClose={resetAlert}
      >
        <Alert severity={snackbarData.severity} sx={{ width: "100%" }}>
          {snackbarData.text}
        </Alert>
      </Snackbar>
    </Fragment>
  );
}

Search.getLayout = (page: ReactElement) => {
  return (
    <HeaderLayout>
      <BodyLayout>{page}</BodyLayout>
    </HeaderLayout>
  );
};
