import useSWRImmutable from "swr/immutable";
import Loading from "../Loading/Loading";
import TurnedInNotIcon from "@mui/icons-material/TurnedInNot";
import styles from "./styles.module.css";
import { getRecentItems } from "../../utilities/app-utilities";
import Anime from "../RecentItems/Anime";
import List from "../RecentItems/List";
import Discussion from "../RecentItems/Discussion";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { RecentProps } from "./types/Recent.types";
import { Database } from "../../database.types";

// TODO: Fully Port this component to TypeScript
export default function Recent(props: RecentProps) {
  const { profileID, type } = props;
  const supabase = useSupabaseClient<Database>();
  const { data, error } = useSWRImmutable(
    [supabase, type, profileID],
    getRecentItems,
  );

  const loading = !data && !error;
  let content = (
    <div className="h-100 d-flex flex-column align-items-center justify-content-center">
      <TurnedInNotIcon sx={{ fontSize: "3rem" }} />
      <span style={{ fontFamily: "'Roboto'" }}>No recent items!</span>
    </div>
  );
  if (loading) {
    content = <Loading />;
  } else if (error) {
    content = (
      <li className="w-100 h-100 text-center mt-2">
        Failed to load recent items!
      </li>
    );
  } else if (data.length > 0) {
    switch (type) {
      case "animes":
        // TODO: define a type for item
        content = data.map((item: any) => (
          <Anime
            key={item.id}
            id={item.id}
            label={item.title}
            imgSrc={item.photoURL}
            synopsis={item.synopsis}
          />
        ));
        break;
      case "discussions":
        content = data.map((id: number) => <Discussion key={id} id={id} />);
        break;
      case "lists":
        content = data.map((id: number) => <List key={id} id={id} />);
        break;
      default:
        break;
    }
  }
  return <ul className={styles["recent-items"]}>{content}</ul>;
}
