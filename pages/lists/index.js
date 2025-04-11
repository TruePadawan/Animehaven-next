import { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { Masonry } from "@mui/lab";
import Add from "@mui/icons-material/Add";
import {
	Alert,
	Snackbar,
	SwipeableDrawer,
	useMediaQuery,
	Button as MUIButton,
} from "@mui/material";
import BodyLayout from "../../components/BodyLayout/BodyLayout";
import Button from "../../components/Button/Button";
import Select from "../../components/Select/Select";
import Checkbox from "../../components/Checkbox/Checkbox";
import SearchInput from "../../components/Input/SearchInput/SearchInput";
import ListItem from "../../components/Items/ListItem/ListItem";
import { UserAuthContext } from "../../context/UserAuthContext";
import CreateList from "../../components/CreateList/CreateList";
import { LIST_GENRES } from "../../utilities/app-utilities";
import Loading from "../../components/Loading/Loading";
import Head from "next/head";
import CheckboxList from "../../components/CheckboxList/CheckboxList";
import HeaderLayout from "../../components/HeaderLayout/HeaderLayout";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const applyGenreFilter = (lists, acceptedGenres) => {
	const filtered = lists.filter((list) => {
		let accepted = false;
		const { genres } = list;
		for (const genre in genres) {
			if (genres[genre] === true && acceptedGenres[genre] === true) {
				accepted = true;
				break;
			}
		}
		return accepted;
	});
	return filtered;
};

const Lists = () => {
	const supabase = useSupabaseClient();
	const { profileID } = useContext(UserAuthContext);
	const [showCreateListDialog, setShowCreateListDialog] = useState(false);
	const [lists, setLists] = useState([]);
	const [listFilter, setListFilter] = useState("all");
	const [queryOngoing, setQueryOngoing] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [acceptedGenres, setAcceptedGenres] = useState(() => {
		let obj = {};
		LIST_GENRES.forEach((genre) => {
			obj[genre.toUpperCase()] = true;
		});
		return obj;
	});
	const [error, setError] = useState({ occurred: false, text: "" });
	const [filterDrawerIsOpen, setFilterDrawerIsOpen] = useState(false);
	const matchesSmallDevice = useMediaQuery("(max-width: 600px)");

	const handleError = (text, error) => {
		setError({
			occurred: true,
			text: `${text} - ${error.message || error.error_description}`,
		});
	};

	const resetError = (event, reason) => {
		if (reason === "clickaway") {
			return;
		}
		setError({ occurred: false, text: "" });
	};

	// SHOW PUBLIC LISTS OR USER OWN LISTS
	useEffect(() => {
		setQueryOngoing(true);
		if (listFilter === "all") {
			supabase
				.from("anime_lists")
				.select("id,genres")
				.order("created_at", { ascending: false })
				.throwOnError()
				.then(
					({ data }) => {
						const filteredLists = applyGenreFilter(data, acceptedGenres);
						setLists(filteredLists);
						setQueryOngoing(false);
					},
					(error) => {
						handleError("Failed to retrieve public lists", error);
						setLists([]);
						setQueryOngoing(false);
					}
				);
		} else if (listFilter === "your_lists" && profileID !== null) {
			supabase
				.from("anime_lists")
				.select("id,genres")
				.eq("creator_id", profileID)
				.order("created_at", { ascending: false })
				.throwOnError()
				.then(
					({ data }) => {
						const filteredLists = applyGenreFilter(data, acceptedGenres);
						setLists(filteredLists);
						setQueryOngoing(false);
					},
					(error) => {
						handleError("Failed to retrieve user lists", error);
						setLists([]);
						setQueryOngoing(false);
					}
				);
		}
	}, [listFilter, profileID, acceptedGenres]);

	const openCreateListDialog = () => setShowCreateListDialog(true);
	const closeCreateListDialog = () => setShowCreateListDialog(false);
	const onListFilterChanged = (e) => setListFilter(e.target.value);
	const updateSearchText = (e) => setSearchText(e.target.value);
	const updateAcceptedGenres = (e) => {
		setAcceptedGenres((current) => {
			current[e.target.name] = e.target.checked;
			return { ...current };
		});
	};

	const searchForLists = async (e) => {
		e.preventDefault();
		let filteredSearchResults = [];

		setQueryOngoing(true);
		try {
			if (listFilter === "all") {
				let { data: searchResults } = await supabase
					.rpc("search_list", { phrase: searchText })
					.throwOnError();
				filteredSearchResults = applyGenreFilter(searchResults, acceptedGenres);
			} else if (listFilter === "your_lists" && profileID !== null) {
				let { data: searchResults } = await supabase
					.rpc("search_list", { phrase: searchText, profile_id: profileID })
					.throwOnError();
				filteredSearchResults = applyGenreFilter(searchResults, acceptedGenres);
			}
			setLists(filteredSearchResults);
		} catch (error) {
			handleError("Error while trying to search", error);
		}
		setQueryOngoing(false);
	};

	const genreElements = useMemo(() => {
		return LIST_GENRES.map((genre) => (
			<li key={genre}>
				<Checkbox
					id={genre}
					label={genre}
					name={genre.toUpperCase()}
					onChange={updateAcceptedGenres}
					checked={acceptedGenres[genre.toUpperCase()]}
				/>
			</li>
		));
	}, [acceptedGenres]);

	const transformedLists = useMemo(() => {
		return lists.map((list) => {
			return <ListItem key={list.id} listId={list.id} />;
		});
	}, [lists]);

	const toggleFilterDrawer = (open) => {
		setFilterDrawerIsOpen(open);
	};

	const alertAnchorOrigin = {
		vertical: "top",
		horizontal: "center",
	};

	return (
		<Fragment>
			<Head>
				<title>Animehaven | Lists</title>
				<meta
					name="description"
					content="Create, share or browse compilations of different animes."
				/>
				<meta property="og:title" content="Animehaven | Lists" />
				<meta
					property="og:description"
					content="Create, share or browse compilations of different animes."
				/>
				<meta property="og:url" content="https://animehaven.vercel.app/lists" />
				<meta name="twitter:title" content="Animehaven | Lists" />
				<meta
					name="twitter:description"
					content="Create, share or browse compilations of different animes."
				/>
			</Head>
			{profileID && (
				<CreateList
					open={showCreateListDialog}
					onClose={closeCreateListDialog}
					profileId={profileID}
					update={false}
				/>
			)}
			{!matchesSmallDevice && (
				<div className="d-flex flex-column gap-3">
					<Select
						title="Filter lists"
						onChange={onListFilterChanged}
						value={listFilter}>
						<option value="all">All</option>
						{profileID && <option value="your_lists">My Lists</option>}
					</Select>
					<CheckboxList
						className="mt-2"
						label="Genre"
						checkboxes={genreElements}
					/>
				</div>
			)}
			{matchesSmallDevice && (
				<SwipeableDrawer
					anchor="right"
					PaperProps={{ sx: { backgroundColor: "#1E1E1E" } }}
					open={filterDrawerIsOpen}
					onClose={toggleFilterDrawer.bind(this, false)}
					onOpen={toggleFilterDrawer.bind(this, true)}>
					<div className="d-flex flex-column gap-3 p-2">
						<Select
							title="Sort and filter lists"
							onChange={onListFilterChanged}
							value={listFilter}>
							<option value="all">All</option>
							{profileID && <option value="your_lists">My Lists</option>}
						</Select>
						<CheckboxList
							className="mt-2"
							label="Genre"
							checkboxes={genreElements}
						/>
					</div>
				</SwipeableDrawer>
			)}
			<div className="d-flex flex-column gap-2 flex-grow-1">
				<div className="d-flex justify-content-between">
					{matchesSmallDevice && (
						<MUIButton
							onClick={toggleFilterDrawer.bind(this, true)}
							sx={{ color: "whitesmoke" }}>
							Filter
						</MUIButton>
					)}
					{profileID && (
						<Button
							text="New List"
							className="ms-auto"
							icon={<Add />}
							onClick={openCreateListDialog}
						/>
					)}
				</div>
				<div className="d-flex flex-column flex-grow-1">
					<SearchInput
						searchFunc={searchForLists}
						placeholder="Search Lists"
						value={searchText}
						onChange={updateSearchText}
						minLength={4}
						spellCheck={false}
					/>
					{queryOngoing && <Loading sx={{ marginTop: "10px" }} />}
					{!queryOngoing && (
						<Masonry
							columns={{ xs: 1, sm: 2, lg: 3, xl: 4 }}
							spacing={1}
							sx={{ marginTop: "10px" }}>
							{transformedLists}
						</Masonry>
					)}
				</div>
			</div>
			<Snackbar
				open={error.occurred}
				autoHideDuration={6000}
				onClose={resetError}
				anchorOrigin={alertAnchorOrigin}>
				<Alert severity="error" sx={{ width: "100%" }} onClose={resetError}>
					{error.text}
				</Alert>
			</Snackbar>
		</Fragment>
	);
};

export default Lists;

Lists.getLayout = (page) => {
	return (
		<HeaderLayout>
			<BodyLayout className="d-flex gap-2" recentItems="lists">
				{page}
			</BodyLayout>
		</HeaderLayout>
	);
};
