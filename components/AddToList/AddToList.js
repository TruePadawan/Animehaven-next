import {
	Dialog,
	DialogTitle,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	useMediaQuery,
} from "@mui/material";
import { Fragment, useEffect, useState } from "react";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useTheme } from "@mui/material/styles";
import SearchInput from "../Input/SearchInput/SearchInput";
import styles from "./styles.module.css";
import Loading from "../Loading/Loading";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const Item = ({
	id,
	itemData,
	title,
	triggerAlert,
	closeDialog,
	isPrivate = false,
}) => {
	const supabase = useSupabaseClient();
	const addAnimeToList = async () => {
		try {
			const { data } = await supabase
				.from("anime_lists")
				.select("items")
				.eq("id", id)
				.throwOnError()
				.limit(1)
				.single();
			const { items } = data;
			const itemInList = items.some((item) => item.id === itemData.id);
			if (!itemInList) {
				items.push(itemData);
				await supabase
					.from("anime_lists")
					.update({ items })
					.eq("id", id)
					.throwOnError();
				triggerAlert("Anime added successfully!", { severity: "success" });
			} else {
				triggerAlert("Anime already in List!");
			}
			closeDialog();
		} catch (error) {
			triggerAlert("Failed to add anime to list", { severity: "error", error });
		}
	};

	return (
		<ListItem>
			<ListItemButton onClick={addAnimeToList}>
				<ListItemIcon>
					{isPrivate && <LockIcon color="primary" />}
					{!isPrivate && <LockOpenIcon color="primary" />}
				</ListItemIcon>
				<ListItemText primary={title} />
			</ListItemButton>
		</ListItem>
	);
};

const AddToList = ({ itemData, profileID, triggerAlert }) => {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [searchText, setSearchText] = useState("");
	const [items, setItems] = useState([]);
	const [queryOngoing, setQueryOngoing] = useState(false);
	const theme = useTheme();
	const fullScreenBreakpoints = useMediaQuery(theme.breakpoints.down(480));

	useEffect(() => {
		if (dialogOpen === false) return;
		setQueryOngoing(true);
		supabase
			.from("anime_lists")
			.select("id,title,is_public")
			.eq("creator_id", profileID)
			.throwOnError()
			.then(({ data: lists }) => {
				setItems(lists);
				setQueryOngoing(false);
			});
	}, [profileID, dialogOpen]);

	const openDialog = () => {
		setDialogOpen(true);
	};

	const closeDialog = () => {
		setDialogOpen(false);
	};

	const searchHandler = async (event) => {
		event.preventDefault();

		setQueryOngoing(true);
		try {
			const { data: searchResults } = await supabase
				.rpc("search_list", { phrase: searchText, profile_id: profileID })
				.throwOnError();
			setItems(searchResults);
		} catch (error) {
			triggerAlert("Error while trying to search", {
				severity: "error",
				error,
			});
		}
		setQueryOngoing(false);
	};

	const transformedItems = items.map((item) => (
		<Item
			key={item.id}
			id={item.id}
			itemData={itemData}
			title={item.title}
			triggerAlert={triggerAlert}
			isPrivate={!item.is_public}
			closeDialog={closeDialog}
		/>
	));
	return (
		<Fragment>
			<button className={styles["add-to-list-btn"]} onClick={openDialog}>
				Add To List
			</button>
			<Dialog
				fullScreen={fullScreenBreakpoints}
				open={dialogOpen}
				onClose={closeDialog}
				sx={{
					"& .MuiDialog-paper": {
						backgroundColor: "#1e1e1e",
						color: "white",
					},
				}}>
				<DialogTitle>Select List</DialogTitle>
				<div className={styles["dialog-body"]}>
					<SearchInput
						searchFunc={searchHandler}
						minLength={4}
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
					/>
					{queryOngoing && (
						<Loading sx={{ margin: "10px" }} progressElAttr={{ size: 20 }} />
					)}
					{!queryOngoing && (
						<Fragment>
							{transformedItems.length > 0 ? (
								<List>{transformedItems}</List>
							) : (
								<small className="text-center p-1 d-block">No list!</small>
							)}
						</Fragment>
					)}
				</div>
			</Dialog>
		</Fragment>
	);
};

export default AddToList;
