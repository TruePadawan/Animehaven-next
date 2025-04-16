import { TriggerAlert } from "../../../../utilities/global.types";

export interface EditCommentItemProps {
  initialText: string;
  triggerAlert: TriggerAlert;
  commentId: string;
  onCommentEdited: VoidFunction;
  onCancelEditing: VoidFunction;
}
