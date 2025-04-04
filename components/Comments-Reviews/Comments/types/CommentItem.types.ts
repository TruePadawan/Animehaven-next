import {Tables} from "../../../../database.types";
import {TriggerAlertOptions} from "../../../../utilities/global.types";

export interface CommentItemProps {
    commentData: Tables<"comments">;
    triggerAlert: (text: string, options?: TriggerAlertOptions) => void;
    profileID: string | null;
    setReplyData: (
        replyData: { parentCommentID: string, accountName: string }
    ) => void;
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