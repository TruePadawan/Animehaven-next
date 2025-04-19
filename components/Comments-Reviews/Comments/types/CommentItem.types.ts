import { Tables } from "../../../../database.types";
import { UserAuthContextType } from "../../../../context/authentication/UserAuthContext.types";
import { NotificationContextType } from "../../../../context/notifications/NotificationContext.types";

export interface CommentItemProps {
  commentData: Tables<"comments">;
  showNotification: NotificationContextType["showNotification"];
  profileID: UserAuthContextType["profileID"];
  setReplyData: (replyData: {
    parentCommentID: string;
    accountName: string;
  }) => void;
}

export interface ParentCommentData {
  id: string | null;
  text: string | null;
  creator_display_name: string | null;
  creator_account_name: string | null;
}

export interface CommentCreatorData {
  avatar_url: string;
  account_name: string;
  display_name: string;
}
