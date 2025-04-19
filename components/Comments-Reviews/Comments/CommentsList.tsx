import React, {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import CommentItem from "./CommentItem";
import CommentBox from "./CommentBox";
import styles from "../Comments-Reviews.module.css";
import { Button } from "@mui/material";
import {
  getCommentsData,
  numberToString,
} from "../../../utilities/app-utilities";
import { UserAuthContext } from "../../../context/authentication/UserAuthContext";
import CommentIcon from "@mui/icons-material/Comment";
import ShareButton from "../../ShareButton/ShareButton";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import {
  CommentsListProps,
  RealtimePostgresDeleteCommentPayload,
  RealtimePostgresInsertCommentPayload,
  RealtimePostgresUpdateCommentPayload,
} from "./types/CommentsList.types";
import { Database, Tables } from "../../../database.types";
import { PostgrestError } from "@supabase/supabase-js";
import { NotificationContext } from "../../../context/notifications/NotificationContext";

const COMMENTS_PER_REQUEST = 10;
const CommentsList = ({ id, className = "" }: CommentsListProps) => {
  const supabase = useSupabaseClient<Database>();
  const { profileID } = useContext(UserAuthContext);
  const [commentsData, setCommentsData] = useState<Tables<"comments">[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyData, setReplyData] = useState({
    parentCommentID: "",
    accountName: "",
  });
  const { showNotification } = useContext(NotificationContext);
  const totalCommentsCount = useRef(0);

  // LOAD COMMENTS ASSOCIATED WITH INSTANCE ID
  useEffect(() => {
    getCommentsData(supabase, id, COMMENTS_PER_REQUEST)
      .then(({ data, count }) => {
        totalCommentsCount.current = count;
        setCommentsData(data);
      })
      .catch((error) => {
        showNotification("Failed to load comments", {
          severity: "error",
          error,
        });
        setCommentsData([]);
      });
  }, [id, supabase, showNotification]);

  // LISTEN FOR NEW COMMENTS AND UPDATES TO COMMENTS
  useEffect(() => {
    const onCommentAdded = (payload: RealtimePostgresInsertCommentPayload) => {
      const newData = payload.new;
      setCommentsData((snapshot) => {
        if (!snapshot.find((comment) => comment.id === newData.id)) {
          snapshot.unshift(newData);
        }
        return [...snapshot];
      });
    };

    const onCommentUpdated = (
      payload: RealtimePostgresUpdateCommentPayload,
    ) => {
      const updatedCommentID = payload.new.id;
      setCommentsData((snapshot) => {
        for (let i = 0; i < snapshot.length; ++i) {
          if (snapshot[i].id === updatedCommentID) {
            snapshot[i].text = payload.new.text;
            snapshot[i].upvoted_by = payload.new.upvoted_by;
            return [...snapshot];
          }
        }
        return snapshot;
      });
    };

    const onCommentDeleted = (
      payload: RealtimePostgresDeleteCommentPayload,
    ) => {
      const deletedCommentID = payload.old.id;
      setCommentsData((snapshot) => {
        return snapshot.filter(
          (commentData) => commentData.id !== deletedCommentID,
        );
      });
    };

    const channel = supabase
      .channel(`public:comments:instance_id=eq.${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `instance_id=eq.${id}`,
        },
        onCommentAdded,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "comments",
          filter: `instance_id=eq.${id}`,
        },
        onCommentUpdated,
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "comments",
          filter: `instance_id=eq.${id}`,
        },
        onCommentDeleted,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  function resetReplyData() {
    setReplyData({ parentCommentID: "", accountName: "" });
  }

  function onShareSuccess() {
    showNotification("Link Copied!", { severity: "success" });
  }

  function onShareFailed() {
    showNotification("Failed to Copy Link!", { severity: "warning" });
  }

  async function loadMoreCommentsClickHandler() {
    setLoadingComments(true);
    const lastCommentIndex = commentsData?.at(-1)?.index;
    if (lastCommentIndex !== undefined) {
      try {
        const { data } = await getCommentsData(
          supabase,
          id,
          COMMENTS_PER_REQUEST,
          lastCommentIndex,
        );
        setCommentsData((snapshot) => {
          return [...snapshot, ...data];
        });
      } catch (error) {
        showNotification("Failed to load more comments", {
          severity: "error",
          error: error as PostgrestError,
        });
      }
    }
    setLoadingComments(false);
  }

  const replying = replyData.parentCommentID !== "";
  const noComments = commentsData.length === 0;
  const moreComments = commentsData.length < totalCommentsCount.current;
  const commentsCountText = numberToString(commentsData.length, "Comment");

  const comments = useMemo(() => {
    return commentsData.map((commentData) => {
      return (
        <CommentItem
          key={commentData.id}
          setReplyData={setReplyData}
          commentData={commentData}
          showNotification={showNotification}
          profileID={profileID}
        />
      );
    });
  }, [commentsData, showNotification, profileID]);

  const componentClassName = `${styles.component} ${className}`;
  return (
    <div className={componentClassName}>
      {profileID && (
        <Fragment>
          <CommentBox
            instanceID={id}
            profileID={profileID}
            replying={replying}
            replyData={replyData}
            cancelReply={resetReplyData}
            onReplyPosted={resetReplyData}
            showNotification={showNotification}
          />
        </Fragment>
      )}
      <div className="d-flex flex-column gap-1 w-100">
        <div className="d-flex justify-content-between align-items-center mx-2">
          <span className="d-flex gap-1">
            <CommentIcon />
            <span>{commentsCountText}</span>
          </span>
          <ShareButton
            onShareSuccess={onShareSuccess}
            onShareFailed={onShareFailed}
          />
        </div>
        {noComments && (
          <div className="d-flex justify-content-center mt-4">No Comments</div>
        )}
        {!noComments && (
          <Fragment>
            <ul className={styles.items}>{comments}</ul>
            {moreComments && (
              <Button
                type="button"
                variant="contained"
                sx={{ backgroundColor: "dimgray" }}
                disabled={loadingComments}
                onClick={loadMoreCommentsClickHandler}
              >
                Load More Comments
              </Button>
            )}
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default CommentsList;
