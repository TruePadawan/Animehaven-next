import { NotificationContextType } from "../../../../context/notifications/NotificationContext.types";

export interface EditCommentItemProps {
  initialText: string;
  showNotification: NotificationContextType["showNotification"];
  commentId: string;
  onCommentEdited: VoidFunction;
  onCancelEditing: VoidFunction;
}
