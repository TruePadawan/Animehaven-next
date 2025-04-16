import Loading from "../Loading/Loading";
import useSWRImmutable from "swr/immutable";
import AnnouncementItem from "../Items/AnnouncementItem/AnnouncementItem";
import AnnouncementOutlinedIcon from "@mui/icons-material/AnnouncementOutlined";
import styles from "./styles.module.css";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Tables } from "../../database.types";
import { Fragment } from "react";

async function announcementsFetcher(
  supabase: SupabaseClient<Database>,
  tag: Tables<"discussions">["tag"],
) {
  const { data } = await supabase
    .from("discussions")
    .select()
    .eq("tag", tag)
    .limit(3)
    .throwOnError();
  return data;
}

export default function Announcements() {
  const supabase = useSupabaseClient<Database>();
  const { data, error } = useSWRImmutable(
    [supabase, "announcement"],
    announcementsFetcher,
  );
  const loading = !data && !error;
  const hasData = data && !error;

  let content = (
    <li className="h-100 p-3 d-flex flex-column align-items-center justify-content-center">
      <AnnouncementOutlinedIcon sx={{ fontSize: "3rem" }} />
      <span style={{ fontFamily: "'Roboto'" }}>No announcements!</span>
    </li>
  );

  if (loading) {
    content = <Loading />;
  } else if (error) {
    content = (
      <li className="w-100 h-100 text-center mt-2">
        Failed to load announcements!
      </li>
    );
  } else if (hasData && data.length > 0) {
    content = (
      <Fragment>
        {data.map((announcement) => (
          <AnnouncementItem
            key={announcement.id}
            id={announcement.id}
            title={announcement.title}
            body={announcement.body}
            isDataLoaded={true}
          />
        ))}
      </Fragment>
    );
  }

  return <ul className={styles["announcements"]}>{content}</ul>;
}
