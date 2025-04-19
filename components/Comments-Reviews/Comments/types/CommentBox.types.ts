import { NotificationContextType } from "../../../../context/notifications/NotificationContext.types";

export interface CommentBoxProps {
  instanceID: string;
  profileID: string;
  replying: boolean;
  replyData: {
    accountName: string;
    parentCommentID: string;
  };
  cancelReply: () => void;
  onReplyPosted: () => void;
  showNotification: NotificationContextType["showNotification"];
  onCommentPosted?: () => void;
}
