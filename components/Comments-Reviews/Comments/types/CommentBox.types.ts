import {TriggerAlertOptions} from "../../../../utilities/global.types";

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
    triggerAlert: (text: string, options?: TriggerAlertOptions) => void;
    onCommentPosted?: () => void;
}