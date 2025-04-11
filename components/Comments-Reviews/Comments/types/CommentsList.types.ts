import {
    RealtimePostgresDeletePayload,
    RealtimePostgresInsertPayload,
    RealtimePostgresUpdatePayload
} from "@supabase/supabase-js";
import {Tables} from "../../../../database.types";
import {AlertProps} from "@mui/material";

export interface CommentsListProps {
    id: string;
    className?: string;
}

export type RealtimePostgresInsertCommentPayload = RealtimePostgresInsertPayload<Tables<"comments">>
export type RealtimePostgresUpdateCommentPayload = RealtimePostgresUpdatePayload<Tables<"comments">>
export type RealtimePostgresDeleteCommentPayload = RealtimePostgresDeletePayload<Tables<"comments">>

// TODO: make type global
export interface SnackbarProps {
    open: boolean;
    severity: AlertProps["severity"];
    text: string;
}