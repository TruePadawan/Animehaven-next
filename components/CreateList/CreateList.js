import {
	Alert,
	Box,
	Button,
	Checkbox,
	Chip,
	Dialog,
	DialogContent,
	DialogTitle,
	FormControl,
	FormControlLabel,
	FormGroup,
	FormHelperText,
	Radio,
	RadioGroup,
	Snackbar,
	TextareaAutosize,
} from "@mui/material";
import { Fragment, useEffect, useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import { searchAnime } from "../../utilities/mal-api";
import Input from "../Input/Input";
import SearchInput from "../Input/SearchInput/SearchInput";
import Loading from "../Loading/Loading";
import styles from "./style.module.css";
import { supabase } from "../../supabase/config";
import { defaultSnackbarState, getUsefulData, LIST_GENRES } from "../../utilities/app-utilities";
import { useRouter } from "next/router";

const CreateList = (props) => {
	const [visibility, setVisibility] = useState(() => {
		if (props.update === true) {
			return props.defaultValues.is_public === true ? "public" : "private";
		}
		return "public";
	});
	const [listGenres, setListGenres] = useState(() => {
		if (props.update === true) {
			return props.defaultValues.genres;
		}
		let obj = {};
		LIST_GENRES.forEach((genre) => {
			obj[genre.toUpperCase()] = false;
		});
		return obj;
	});
	const [listTitle, setListTitle] = useState(() => {
		return props.update === true ? props.defaultValues.title : "";
	});
	const [listDesc, setListDesc] = useState(() => {
		return props.update === true ? props.defaultValues.desc : "";
	});
	const [items, setItems] = useState(() => {
		return props.update === true ? props.defaultValues.items : [];
	});
	const [error, setError] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [isSearchOngoing, setIsSearchOngoing] = useState(false);
	const [snackbarData, setSnackbarData] = useState(defaultSnackbarState);
	const router = useRouter();

	// KEEP TRACK OF WHETHER THERE IS AT LEAST ONE GENRE SELECTED
	useEffect(() => {
		const selectedGenres = [];
		for (const genre in listGenres) {
			if (listGenres[genre] === true) {
				selectedGenres.push(genre);
			}
		}
		setError(selectedGenres.length === 0);
	}, [listGenres, props.open]);

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

	const cleanup = () => {
		if (props.update === true) {
			props.onClose();
		} else {
			setItems([]);
			setSearchResults([]);
			setError(false);
			setListGenres({});
			setSearchText("");
			setListTitle("");
			setListDesc("");
			setVisibility("public");
			props.onClose();
		}
	};

	const updateVisibility = (e) => setVisibility(e.target.value);

	const updateGenres = (e) => {
		setListGenres((current) => {
			current[e.target.name] = e.target.checked;
			return { ...current };
		});
	};

	const updateSearchText = (e) => setSearchText(e.target.value);

	const addItem = (itemID, itemTitle) => {
		setItems((snapshot) => {
			// PREVENT ADDING DUPLICATES
			for (let i = 0; i < snapshot.length; ++i) {
				if (snapshot[i].id === itemID) {
					return snapshot;
				}
			}
			snapshot.push({ id: itemID, title: itemTitle });
			return [...snapshot];
		});
	};

	const deleteItem = (itemID) => {
		setItems((snapshot) => {
			for (let i = 0; i < snapshot.length; ++i) {
				if (snapshot[i].id === itemID) {
					snapshot = snapshot.filter((item) => item.id !== itemID);
					return [...snapshot];
				}
			}
			return snapshot;
		});
	};

	const searchFunction = async (e) => {
		e.preventDefault();
		setIsSearchOngoing(true);
		const rawAnimesData = await searchAnime(searchText, 10);
		const transformed_list = rawAnimesData.map((animeData) => {
			const { id, title } = getUsefulData(animeData);
			return (
				<Chip
					key={id}
					label={title}
					onClick={addItem.bind(this, id, title)}
					variant="outlined"
					color="info"
				/>
			);
		});
		setSearchResults(transformed_list);
		setIsSearchOngoing(false);
	};

	const createList = async (e) => {
		e.preventDefault();
		try {
			if (error === true) {
				throw new Error("No genre selected");
			}
			if (props.profileID === null) {
				throw new Error("no user signed in");
			}

			await supabase
				.from("anime_lists")
				.insert({
					title: listTitle,
					description: listDesc,
					genres: listGenres,
					items,
					creator_id: props.profileID,
					is_public: visibility === "public",
				})
				.throwOnError();
			cleanup();
			setSnackbarData({
				text: "List successfully created!",
				open: true,
				severity: "success",
			});
		} catch (error) {
			triggerAlert("Failed to create list", { severity: "error", error });
		}
	};

	const updateList = async (e) => {
		e.preventDefault();
		try {
			if (error === true) {
				throw new Error("No genre selected");
			}
			if (props.profileID === null) {
				throw new Error("no user signed in");
			}

			await supabase
				.from("anime_lists")
				.update({
					title: listTitle,
					description: listDesc,
					genres: listGenres,
					items,
					creator_id: props.profileID,
					is_public: visibility === "public",
				})
				.eq("id", props.defaultValues.id)
				.throwOnError();
			window.location.reload();
		} catch (error) {
			triggerAlert("Failed to update list", { severity: "error", error });
		}
	};

	const deleteList = async (e) => {
		try {
			if (!props.defaultValues.id) {
				throw new Error("Couldn't get ID of the list, try reloading the page!");
			}
			await supabase
				.from("anime_lists")
				.delete()
				.eq("id", props.defaultValues.id)
				.throwOnError();
			router.replace("/lists");
		} catch (error) {
			triggerAlert("Failed to delete list", { severity: "error", error });
		}
	};

	const genresEl = useMemo(() => {
		return LIST_GENRES.map((genre) => (
			<FormControlLabel
				key={uuid()}
				control={
					<Checkbox
						name={genre.toUpperCase()}
						onChange={updateGenres}
						checked={listGenres[genre.toUpperCase()]}
					/>
				}
				label={genre}
			/>
		));
	}, [listGenres]);

	const transformedItems = useMemo(() => {
		return items.map((item) => {
			return (
				<Chip
					key={item.id}
					variant="outlined"
					label={item.title}
					color="primary"
					onDelete={deleteItem.bind(this, item.id)}
				/>
			);
		});
	}, [items]);

	const alertAnchorOrigin = {
		vertical: "top",
		horizontal: "center",
	};
	return (
		<Fragment>
			<Dialog
				open={props.open}
				onClose={cleanup}
				maxWidth={"md"}
				fullWidth
				sx={{
					"& .MuiDialog-paper": {
						backgroundColor: "#1e1e1e",
						color: "white",
						margin: "1%",
						width: "100%",
					},
				}}>
				<DialogTitle sx={{ fontSize: "1.4rem" }}>
					{props.update ? "Update List" : "Create List"}
				</DialogTitle>
				<DialogContent sx={{ padding: "2%" }}>
					<Box className={styles.component}>
						<Box
							component="form"
							className={styles.createListForm}
							onSubmit={props.update ? updateList : createList}>
							<div className="d-flex flex-column">
								<label htmlFor="title-input-field" className={styles.label}>
									Title
								</label>
								<Input
									id="title-input-field"
									className={styles.titlefield}
									minLength={4}
									value={listTitle}
									onChange={(e) => setListTitle(e.target.value)}
									required
								/>
							</div>
							<div className="d-flex flex-column">
								<label htmlFor="desc-input-field" className={styles.label}>
									Description
								</label>
								<TextareaAutosize
									id="desc-input-field"
									className={styles.descfield}
									value={listDesc}
									onChange={(e) => setListDesc(e.target.value)}
								/>
							</div>
							<FormControl>
								<label id="visibility" className={styles.label}>
									Visibility
								</label>
								<RadioGroup
									row
									aria-labelledby="visibility"
									value={visibility}
									onChange={updateVisibility}>
									<FormControlLabel
										value="public"
										control={<Radio />}
										label="Public"
										labelPlacement="start"
									/>
									<FormControlLabel
										value="private"
										control={<Radio />}
										label="Private"
										labelPlacement="start"
									/>
								</RadioGroup>
							</FormControl>
							<FormControl error={error}>
								<label id="genres" className={styles.label}>
									Genres
								</label>
								<FormGroup row aria-labelledby="genres">
									{genresEl}
								</FormGroup>
								<FormHelperText sx={{ color: "white" }}>
									Select at least one genre
								</FormHelperText>
							</FormControl>
							<div className="d-flex flex-wrap gap-2 justify-content-end">
								<Button
									variant="contained"
									type="submit"
									sx={{ fontFamily: "inherit" }}
									disabled={error}>
									{props.update ? "Update" : "Create"}
								</Button>
								{props.update && (
									<Button
										variant="contained"
										type="button"
										color="error"
										onClick={deleteList}
										sx={{ fontFamily: "inherit" }}>
										Delete
									</Button>
								)}
								<Button
									type="button"
									onClick={cleanup}
									sx={{ fontFamily: "inherit" }}>
									Cancel
								</Button>
							</div>
							<hr className={styles.divider} />
						</Box>
						<Box className={styles.addItems}>
							<div className="d-flex flex-column gap-1">
								<span className={styles.label}>
									{props.update ? "Items" : "Items (optional)"}
								</span>
								<div className="d-flex flex-wrap gap-1">{transformedItems}</div>
							</div>
							<div className="d-flex flex-column">
								<span className={styles.label}>Search</span>
								<SearchInput
									placeholder="Search for items"
									minLength={3}
									searchFunc={searchFunction}
									value={searchText}
									onChange={updateSearchText}
								/>
								{isSearchOngoing === true && (
									<Loading sx={{ marginTop: "4px" }} />
								)}
								{isSearchOngoing === false && (
									<div className="mt-2 d-flex flex-wrap gap-1">
										{searchResults}
									</div>
								)}
							</div>
						</Box>
					</Box>
				</DialogContent>
			</Dialog>
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
};

export default CreateList;
