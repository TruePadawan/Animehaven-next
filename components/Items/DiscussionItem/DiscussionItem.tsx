import Link from "next/link";
import styles from "./style.module.css";
import { useEffect, useState } from "react";
import { getProfileData } from "../../../utilities/app-utilities";
import { Skeleton } from "@mui/material";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database, Tables } from "../../../database.types";

type DiscussionItemProps = Omit<
  Tables<"discussions">,
  "body" | "comment_instance_id" | "created_at"
>;
export default function DiscussionItem(props: DiscussionItemProps) {
  const supabase = useSupabaseClient<Database>();
  const [creatorAcctName, setCreatorAcctName] = useState("");

  useEffect(() => {
    getProfileData(supabase, props.creator_id).then((data) => {
      setCreatorAcctName(data.account_name);
    });
  }, [props.creator_id, supabase]);

  const loading = creatorAcctName === "";
  if (loading) {
    return (
      <li className={styles["discussion-item"]}>
        <Skeleton variant="text" />
        <div className="d-flex gap-2">
          <Skeleton variant="text" />
          <Skeleton variant="text" />
        </div>
      </li>
    );
  }
  return (
    <li className={styles["discussion-item"]}>
      <div className={styles.tag}>{`#${props.tag}`}</div>
      <Link href={`/discussions/${props.id}`} className={styles.title}>
        {props.title}
      </Link>
      <small className={styles.creator}>
        Created by{" "}
        <Link href={`/users/${creatorAcctName}`}>{creatorAcctName}</Link>
      </small>
    </li>
  );
}
