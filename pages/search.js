import PageContainer from "../components/PageContainer/PageContainer";
import { Fragment, useEffect, useState } from "react";
import { useMemo } from "react";
import { useCallback } from "react";
import SearchBar from "../components/SearchBar/SearchBar";
import SearchResultItem from "../components/Items/SearchResultItem/SearchResultItem";
import UserItem from "../components/Items/UserItem/UserItem";
import Loading from "../components/Loading/Loading";
import { searchAnime } from "../utilities/mal-api";
import { Alert, Box, Snackbar } from "@mui/material";
import { supabase } from "../supabase/config";
import Head from "next/head";
import { useRouter } from "next/router";
import { getUsefulData } from "../utilities/app-utilities";

const defaultSnackbarState = { open: false, severity: "info", text: "" };
export default function Search() {
	const [searchResult, setSearchResult] = useState([]);
	const [loading, setLoading] = useState(false);
	const [snackbarData, setSnackbarData] = useState(defaultSnackbarState);
	const searchCategories = useMemo(() => ["Anime", "User"], []);
	const router = useRouter();
	const queryParams = router.query;
	const searchText = queryParams.text || null;
	const searchCategory = queryParams.cat || null;

	const searchFunc = useCallback((searchText, searchCategory) => {
		setLoading(true);
		if (searchCategory === "ANIME") {
			searchAnime(searchText)
				.then((data) => {
					const list = data.map((anime) => {
						const { id, title, imageURL } = getUsefulData(anime);
						return (
							<SearchResultItem
								key={id}
								itemID={id}
								title={title}
								photoURL={imageURL}
								type="item"
							/>
						);
					});
					setSearchResult(list);
				})
				.catch((error) => {
					triggerAlert("Search failed!", { severity: "error", error });
				})
				.finally(() => {
					setLoading(false);
				});
		} else if (searchCategory === "USER") {
			const result = [];
			supabase.rpc("search_user", { phrase: searchText }).then(
				(dbQueryResult) => {
					const users = dbQueryResult.data;
					users.forEach((user) => {
						const { account_name, display_name, created_at, avatar_url } = user;
						result.push(
							<UserItem
								key={account_name}
								accountName={account_name}
								title={display_name}
								avatarURL={avatar_url}
								timestamp={created_at}
							/>
						);
					});
					setSearchResult(result);
					setLoading(false);
				},
				(error) => {
					triggerAlert("Search failed!", { severity: "error", error });
					setLoading(false);
				}
			);
		}
	}, []);

	// LOOK FOR SEARCH PARAMS IN PAGE URL
	useEffect(() => {
		if (searchText && searchCategory) {
			searchFunc(searchText, searchCategory.toUpperCase());
		}
	}, [searchText, searchCategory, searchFunc]);

	const triggerAlert = (text, options) => {
		const alertSeverity = options?.severity || "info";
		const alertText =
			alertSeverity === "error"
				? `${text} - ${
						options.error.message || options.error.error_description
				  }`
				: text;
		setSnackbarData({ text: alertText, open: true, severity: alertSeverity });
	};

	const resetAlert = (e, reason) => {
		if (reason === "clickaway") {
			return;
		}
		setSnackbarData(defaultSnackbarState);
	};

	const alertAnchorOrigin = {
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
				sx={{ maxWidth: "900px", margin: "0 auto" }}>
				<SearchBar
					searchCategories={searchCategories}
					searchText={searchText}
					searchCategory={searchCategory}
				/>
				{loading && <Loading sx={{ paddingTop: "1rem" }} />}
				{!loading && (
					<ul className="d-flex flex-wrap gap-2 py-2 align-self-start">
						{searchResult}
					</ul>
				)}
			</Box>
			<Snackbar
				open={snackbarData.open}
				autoHideDuration={5000}
				anchorOrigin={alertAnchorOrigin}
				onClose={resetAlert}>
				<Alert
					onClose={resetAlert}
					severity={snackbarData.severity}
					sx={{ width: "100%" }}>
					{snackbarData.text}
				</Alert>
			</Snackbar>
		</Fragment>
	);
}

Search.getLayout = (page) => <PageContainer>{page}</PageContainer>;
