import useSWRImmutable from "swr/immutable";
import Loading from "../Loading/Loading";
import TurnedInNotIcon from "@mui/icons-material/TurnedInNot";
import styles from "./pagecontainer.module.css";
import { getRecentItems } from "../../utilities/app-utilities";
import Anime from "../RecentItems/Anime";

export default function Recent({ profileID, type }) {
	const { data, error } = useSWRImmutable([type, profileID], getRecentItems);

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
				content = data.map((item) => (
					<Anime
						id={item.id}
						label={item.title}
						imgSrc={item.photoURL}
						synopsis={item.synopsis}
					/>
				));
				break;
			case "discussions":
				break;
			case "lists":
				break;
			default:
				break;
		}
	}
	return <ul className={styles["recent-items"]}>{content}</ul>;
}
