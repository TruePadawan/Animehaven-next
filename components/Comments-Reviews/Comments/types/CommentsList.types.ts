import {
  RealtimePostgresDeletePayload,
  RealtimePostgresInsertPayload,
  RealtimePostgresUpdatePayload,
} from "@supabase/supabase-js";
import { Tables } from "../../../../database.types";

export interface CommentsListProps {
  id: string;
  className?: string;
}

export type RealtimePostgresInsertCommentPayload =
  RealtimePostgresInsertPayload<Tables<"comments">>;
export type RealtimePostgresUpdateCommentPayload =
  RealtimePostgresUpdatePayload<Tables<"comments">>;
export type RealtimePostgresDeleteCommentPayload =
  RealtimePostgresDeletePayload<Tables<"comments">>;
