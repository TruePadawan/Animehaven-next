import {
  Fragment,
  SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import styles from "./style.module.css";
import Link from "next/link";
import { UserAuthContext } from "../../../context/authentication/UserAuthContext";
import { Alert, Button, Skeleton, Snackbar } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  getErrorMessage,
  getProfileData,
} from "../../../utilities/app-utilities";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database, Tables } from "../../../database.types";
import {
  SnackbarState,
  TriggerAlertOptions,
} from "../../../utilities/global.types";
import { PostgrestError } from "@supabase/supabase-js";
import { DEFAULT_SNACKBAR_STATE } from "../../../utilities/global-constants";

interface ListItemProps {
  listId: number;
  skeleton?: boolean;
}

export default function ListItem({ listId, skeleton = false }: ListItemProps) {
  const supabase = useSupabaseClient<Database>();
  const { profileID } = useContext(UserAuthContext);
  const [loading, setLoading] = useState(true);
  const [listTitle, setListTitle] = useState("");
  const [listDesc, setListDesc] = useState("");
  const [creator, setCreator] = useState("");
  const [creatorID, setCreatorID] = useState("");
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [undoSaveDisabled, setUndoSaveDisabled] = useState(true);
  const [snackbarData, setSnackbarData] = useState<SnackbarState>(
    DEFAULT_SNACKBAR_STATE,
  );
  const [isSaved, setIsSaved] = useState(false);

  const triggerAlert = useCallback(
    (text: string, options?: TriggerAlertOptions) => {
      const alertSeverity = options?.severity;
      setSnackbarData({
        open: true,
        severity: alertSeverity || "info",
        text:
          alertSeverity === "error"
            ? `${text} - ${getErrorMessage(options?.error)}`
            : text,
      });
    },
    [],
  );

  useEffect(() => {
    if (listId === undefined) {
      return;
    }
    supabase
      .from("anime_lists")
      .select()
      .eq("id", listId)
      // .throwOnError()
      .limit(1)
      .single()
      .then((result) => {
        if (result.error) {
          return triggerAlert(`Error while loading list with id ${listId}`, {
            error: result.error as PostgrestError,
            severity: "error",
          });
        }
        const { title, description, creator_id } = result.data;
        setListTitle(title);
        setListDesc(description);
        setCreatorID(creator_id);
        getProfileData(supabase, creator_id).then(({ account_name }) => {
          setCreator(account_name);
          setLoading(false);
        });
        // ENABLE SAVE BTN IF LIST WAS NOT CREATED BY SIGNED IN USER AND IT ISN'T ALREADY SAVED
        if (profileID === undefined) {
          setSaveDisabled(true);
        } else {
          getProfileData(supabase, profileID).then(({ saved_lists }) => {
            if (
              creator_id !== profileID &&
              saved_lists.includes(listId.toString()) === false
            ) {
              setIsSaved(false);
              setSaveDisabled(false);
            } else if (
              creator_id !== profileID &&
              saved_lists.includes(listId.toString()) === true
            ) {
              setIsSaved(true);
              setUndoSaveDisabled(false);
            }
          });
        }
      });
  }, [listId, profileID, supabase]);

  const saveList = async () => {
    if (profileID !== undefined && creatorID !== profileID) {
      setSaveDisabled(true);
      try {
        const { saved_lists } = await getProfileData(supabase, profileID);
        if (saved_lists.includes(listId.toString()) === false) {
          saved_lists.push(listId.toString());
          await supabase
            .from("profiles")
            .update({ saved_lists })
            .eq("id", profileID)
            .throwOnError();

          setIsSaved(true);
          setSaveDisabled(false);
          setUndoSaveDisabled(false);
          triggerAlert("List saved successfully", { severity: "success" });
        } else {
          triggerAlert("List is already saved", { severity: "info" });
        }
      } catch (error) {
        triggerAlert("Error while saving list", {
          error: error as PostgrestError,
          severity: "error",
        });
        setSaveDisabled(false);
      }
    }
  };

  const undoSave = async () => {
    if (profileID !== undefined && creatorID !== profileID) {
      setUndoSaveDisabled(true);
      try {
        let { saved_lists }: Tables<"profiles"> = await getProfileData(
          supabase,
          profileID,
        );
        if (saved_lists.includes(listId.toString())) {
          saved_lists = saved_lists.filter((id) => id !== listId.toString());
          await supabase
            .from("profiles")
            .update({ saved_lists })
            .eq("id", profileID)
            .throwOnError();

          setIsSaved(false);
          setSaveDisabled(false);
          setUndoSaveDisabled(false);
          triggerAlert("List removed", { severity: "success" });
        } else {
          triggerAlert("Error while removing list", {
            error: new Error("List isn't saved"),
            severity: "error",
          });
        }
      } catch (error) {
        triggerAlert("Error while removing list", {
          severity: "error",
          error: error as PostgrestError,
        });
        setUndoSaveDisabled(false);
      }
    }
  };

  const closeSnackbar = (e: SyntheticEvent | Event, reason: string) => {
    if (reason !== "clickaway") {
      setSnackbarData((snapshot) => {
        return { ...snapshot, open: false };
      });
    }
  };

  const saveBtnStyle = {
    color: "#ad6837ec",
    fontFamily: "'Radio Canada', sans-serif",
    "&:hover": {
      color: "#995c31",
    },
  };

  return (
    <Fragment>
      <Snackbar
        open={snackbarData.open}
        onClose={closeSnackbar}
        autoHideDuration={4500}
      >
        <Alert severity={snackbarData.severity}>{snackbarData.text}</Alert>
      </Snackbar>
      {!loading && (
        <div className={styles["list-item"]}>
          <div className="d-flex justify-content-between align-items-start">
            <div className="d-flex flex-column">
              <Link className={styles.title} href={`/lists/${listId}`}>
                {listTitle}
              </Link>
              <Link className={styles.creator} href={`/users/${creator}`}>
                {creator}
              </Link>
            </div>
            {!isSaved && (
              <Button
                type="button"
                onClick={saveList}
                startIcon={<ContentCopyIcon />}
                sx={saveBtnStyle}
                disabled={saveDisabled}
              >
                Save
              </Button>
            )}
            {isSaved && (
              <Button
                type="button"
                onClick={undoSave}
                startIcon={<ContentCopyIcon />}
                sx={saveBtnStyle}
                disabled={undoSaveDisabled}
              >
                Saved
              </Button>
            )}
          </div>
          {listDesc !== "" && <div className={styles.desc}>{listDesc}</div>}
        </div>
      )}

      {(loading || skeleton) && (
        <div className={styles["list-item"]}>
          <Skeleton variant="text" />
          <Skeleton variant="text" sx={{ fontSize: "0.8rem" }} />
          <Skeleton variant="rectangular" />
        </div>
      )}
    </Fragment>
  );
}
