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
import { ChangeEvent, FormEvent, Fragment, useEffect, useState } from "react";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { useTheme } from "@mui/material/styles";
import SearchInput from "../Input/SearchInput/SearchInput";
import styles from "./styles.module.css";
import Loading from "../Loading/Loading";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  AddToListProps,
  AnimeListItemProps,
  StrippedAnimeListItemData,
} from "./AddToList.types";
import { Database } from "../../database.types";
import { PostgrestError } from "@supabase/supabase-js";

const AddToList = (props: AddToListProps) => {
  const { itemData, profileID, triggerAlert } = props;
  const supabase = useSupabaseClient<Database>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [items, setItems] = useState<Array<StrippedAnimeListItemData>>([]);
  const [queryOngoing, setQueryOngoing] = useState(false);
  const theme = useTheme();
  const fullScreenBreakpoints = useMediaQuery(theme.breakpoints.down(480));

  useEffect(() => {
    if (!dialogOpen) return;
    setQueryOngoing(true);
    supabase
      .from("anime_lists")
      .select("id,title,is_public")
      .eq("creator_id", profileID)
      .then(({ data: lists, error }) => {
        if (error) throw error;
        setItems(lists);
        setQueryOngoing(false);
      });
  }, [profileID, dialogOpen, supabase]);

  const openDialog = () => {
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const searchHandler = async (event: FormEvent) => {
    event.preventDefault();

    setQueryOngoing(true);
    try {
      const { data: searchResults, error } = await supabase
        .rpc("search_list", { phrase: searchText, profile_id: profileID })
        .select("id,title,is_public");
      if (error) {
        return triggerAlert("Error while trying to search", {
          severity: "error",
          error: error as PostgrestError,
        });
      }
      setItems(searchResults);
    } catch (error) {
      triggerAlert("Error while trying to search", {
        severity: "error",
        error: error as PostgrestError,
      });
    }
    setQueryOngoing(false);
  };

  const transformedItems = items.map((item) => (
    <AnimeListItem
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
        }}
      >
        <DialogTitle>Select List</DialogTitle>
        <div className={styles["dialog-body"]}>
          <SearchInput
            searchFunc={searchHandler}
            minLength={4}
            value={searchText}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchText(e.target.value)
            }
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

const AnimeListItem = (props: AnimeListItemProps) => {
  const {
    id,
    itemData,
    title,
    triggerAlert,
    closeDialog,
    isPrivate = false,
  } = props;
  const supabase = useSupabaseClient<Database>();
  const addAnimeToList = async () => {
    try {
      const { data, error } = await supabase
        .from("anime_lists")
        .select("items")
        .eq("id", id)
        .limit(1)
        .single();
      if (error) {
        return triggerAlert("Failed to add anime to list", {
          severity: "error",
          error: error as PostgrestError,
        });
      }

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
      triggerAlert("Failed to add anime to list", {
        severity: "error",
        error: error as PostgrestError,
      });
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

export default AddToList;
