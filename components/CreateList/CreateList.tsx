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
    Snackbar, SnackbarOrigin,
    TextareaAutosize,
} from "@mui/material";
import {ChangeEvent, FormEvent, Fragment, ReactElement, useEffect, useMemo, useState} from "react";
import {v4 as uuid} from "uuid";
import {searchAnime} from "../../utilities/mal-api";
import Input from "../Input/Input";
import SearchInput from "../Input/SearchInput/SearchInput";
import Loading from "../Loading/Loading";
import styles from "./style.module.css";
import {getErrorMessage, getRelevantAnimeData} from "../../utilities/app-utilities";
import {useRouter} from "next/router";
import {useSupabaseClient} from "@supabase/auth-helpers-react";
import {Database} from "../../database.types";
import {CreateListProps, ListGenres} from "./CreateList.types";
import {ResetAlert, SnackbarState, TriggerAlert} from "../../utilities/global.types";
import {PostgrestError} from "@supabase/supabase-js";
import {DEFAULT_SNACKBAR_STATE, LIST_GENRES} from "../../utilities/global-constants";

// Consider renaming this to ManageAnimeList or most likely splitting the component into 2 separate ones
const CreateList = (props: CreateListProps) => {
    // props.defaultValues !== undefined when editing an anime list item rather than creating one
    const supabase = useSupabaseClient<Database>();
    const [visibility, setVisibility] = useState(() => {
        if (props.defaultValues !== undefined) {
            return props.defaultValues.is_public === true ? "public" : "private";
        }
        return "public";
    });
    const [listGenres, setListGenres] = useState<ListGenres>(() => {
        if (props.defaultValues !== undefined) {
            return props.defaultValues.genres
        }
        const genres: ListGenres = {};
        LIST_GENRES.forEach((genre) => {
            genres[genre.toUpperCase()] = false;
        });
        return genres;
    });
    const [listTitle, setListTitle] = useState(() => {
        if (props.defaultValues !== undefined) {
            return props.defaultValues.title;
        }
        return "";
    });
    const [listDesc, setListDesc] = useState(() => {
        if (props.defaultValues !== undefined) {
            return props.defaultValues.desc;
        }
        return "";
    });
    const [items, setItems] = useState(() => {
        if (props.defaultValues !== undefined) {
            return props.defaultValues.items;
        }
        return [];
    });
    const [error, setError] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState<ReactElement[]>([]);
    const [isSearchOngoing, setIsSearchOngoing] = useState(false);
    const [snackbarData, setSnackbarData] = useState<SnackbarState>(DEFAULT_SNACKBAR_STATE);
    const router = useRouter();

    // KEEP TRACK OF WHETHER THERE IS AT LEAST ONE GENRE SELECTED
    useEffect(() => {
        const selectedGenres = [];
        for (const genre in listGenres) {
            if (listGenres[genre]) {
                selectedGenres.push(genre);
            }
        }
        setError(selectedGenres.length === 0);
    }, [listGenres, props.open]);

    const triggerAlert: TriggerAlert = (text, options) => {
        const alertSeverity = options?.severity || "info";
        const alertText =
            alertSeverity === "error"
                ? `${text} - ${
                    getErrorMessage(options?.error)
                }`
                : text;
        setSnackbarData({text: alertText, open: true, severity: alertSeverity});
    };

    const resetAlert: ResetAlert = (e, reason) => {
        if (reason !== "clickaway") {
            setSnackbarData(DEFAULT_SNACKBAR_STATE);
        }
    };

    const cleanup = () => {
        const isEditingAnimeList = props.defaultValues !== undefined;
        if (isEditingAnimeList) {
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

    const updateVisibility = (e: ChangeEvent<HTMLInputElement>, value: string) => setVisibility(value);

    const updateGenres = (e: ChangeEvent<HTMLInputElement>) => {
        setListGenres((current) => {
            current[e.target.name] = e.target.checked;
            return {...current};
        });
    };

    const updateSearchText = (e: ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value);

    const addItem = (itemID: string, itemTitle: string) => {
        setItems((snapshot) => {
            // PREVENT ADDING DUPLICATES
            for (let i = 0; i < snapshot.length; ++i) {
                if (snapshot[i].id === itemID) {
                    return snapshot;
                }
            }
            snapshot.push({id: itemID, title: itemTitle});
            return [...snapshot];
        });
    };

    const deleteItem = (itemID: string) => {
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

    const searchFunction = async () => {
        setIsSearchOngoing(true);
        const rawAnimesData = await searchAnime(searchText, 10);
        const transformed_list = rawAnimesData.map((animeData) => {
            const {id, title} = getRelevantAnimeData(animeData);
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

    const createList = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (error) {
                return triggerAlert("Failed to create list", {
                    severity: "error", error: {
                        message: "No genre selected"
                    }
                });
            }
            if (props.profileId === null) {
                return triggerAlert("Failed to create list", {
                    severity: "error", error: {
                        message: "No user signed in"
                    }
                });
            }

            await supabase
                .from("anime_lists")
                .insert({
                    title: listTitle,
                    description: listDesc,
                    genres: listGenres,
                    items,
                    creator_id: props.profileId,
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
            triggerAlert("Failed to create list", {severity: "error", error: error as PostgrestError});
        }
    };

    const updateList = async (e: FormEvent) => {
        e.preventDefault();
        try {
            if (error) {
                return triggerAlert("Failed to update list", {
                    severity: "error", error: {
                        message: "No genre selected"
                    }
                });
            }
            if (props.profileId === null) {
                return triggerAlert("Failed to update list", {
                    severity: "error", error: {
                        message: "No user signed in"
                    }
                });
            }
            if (props.defaultValues?.id === undefined) {
                return triggerAlert("Failed to update list", {
                    severity: "error", error: {
                        message: "Could not get the Id of the anime list, try reloading the page"
                    }
                });
            }

            await supabase
                .from("anime_lists")
                .update({
                    title: listTitle,
                    description: listDesc,
                    genres: listGenres,
                    items,
                    creator_id: props.profileId,
                    is_public: visibility === "public",
                })
                .eq("id", props.defaultValues.id)
                .throwOnError();
            window.location.reload();
        } catch (error) {
            triggerAlert("Failed to update list", {severity: "error", error: error as PostgrestError});
        }
    };

    const deleteList = async () => {
        try {
            if (props.defaultValues?.id === undefined) {
                return triggerAlert("Failed to delete list", {
                    severity: "error", error: {
                        message: "Could not get the Id of the anime list, try reloading the page"
                    }
                });
            }
            await supabase
                .from("anime_lists")
                .delete()
                .eq("id", props.defaultValues.id)
                .throwOnError();
            await router.replace("/lists");
        } catch (error) {
            triggerAlert("Failed to delete list", {severity: "error", error: error as PostgrestError});
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

    const alertAnchorOrigin: SnackbarOrigin = {
        vertical: "top",
        horizontal: "center",
    };
    const isEditingAnimeList = props.defaultValues !== undefined;
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
                <DialogTitle sx={{fontSize: "1.4rem"}}>
                    {isEditingAnimeList ? "Update List" : "Create List"}
                </DialogTitle>
                <DialogContent sx={{padding: "2%"}}>
                    <Box className={styles.component}>
                        <Box
                            component="form"
                            className={styles.createListForm}
                            onSubmit={isEditingAnimeList ? updateList : createList}>
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
                                        control={<Radio/>}
                                        label="Public"
                                        labelPlacement="start"
                                    />
                                    <FormControlLabel
                                        value="private"
                                        control={<Radio/>}
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
                                <FormHelperText sx={{color: "white"}}>
                                    Select at least one genre
                                </FormHelperText>
                            </FormControl>
                            <div className="d-flex flex-wrap gap-2 justify-content-end">
                                <Button
                                    variant="contained"
                                    type="submit"
                                    sx={{fontFamily: "inherit"}}
                                    disabled={error}>
                                    {isEditingAnimeList ? "Update" : "Create"}
                                </Button>
                                {isEditingAnimeList && (
                                    <Button
                                        variant="contained"
                                        type="button"
                                        color="error"
                                        onClick={deleteList}
                                        sx={{fontFamily: "inherit"}}>
                                        Delete
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    onClick={cleanup}
                                    sx={{fontFamily: "inherit"}}>
                                    Cancel
                                </Button>
                            </div>
                            <hr className={styles.divider}/>
                        </Box>
                        <Box className={styles.addItems}>
                            <div className="d-flex flex-column gap-1">
								<span className={styles.label}>
									{isEditingAnimeList ? "Items" : "Items (optional)"}
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
                                {isSearchOngoing && (
                                    <Loading sx={{marginTop: "4px"}}/>
                                )}
                                {!isSearchOngoing && (
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
                    severity={snackbarData.severity}
                    sx={{width: "100%"}}>
                    {snackbarData.text}
                </Alert>
            </Snackbar>
        </Fragment>
    );
};

export default CreateList;
