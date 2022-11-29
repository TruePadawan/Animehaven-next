import Loading from "../Loading/Loading";
import useSWRImmutable from "swr/immutable";
import AnnouncementItem from "../Items/AnnouncementItem/AnnouncementItem";
import styles from "./pagecontainer.module.css";
import { supabase } from "../../supabase/config";
import AnnouncementIcon from "@mui/icons-material/Announcement";

async function announcementsFetcher(tag) {
	const { data } = await supabase
		.from("discussions")
		.select()
		.eq("tag", tag)
		.limit(3)
		.throwOnError();
	return data;
}

export default function Announcements() {
	const { data, error } = useSWRImmutable("announcement", announcementsFetcher);

	const loading = !data && !error;
	let content = (
		<div className="h-100 d-flex flex-column align-items-center justify-content-center">
			<AnnouncementIcon sx={{ fontSize: "3rem" }} />
			<span style={{ fontFamily: "'Roboto'" }}>No Announcements!</span>
		</div>
	);
	if (loading) {
		content = <Loading />;
	} else if (error) {
		content = (
			<div className="w-100 h-100 text-center mt-2">
				Failed to load announcements!
			</div>
		);
	} else if (data.length > 0) {
		content = data.map((announcement) => (
			<AnnouncementItem
				id={announcement.id}
				title={announcement.title}
				body={announcement.body}
				isDataLoaded={true}
			/>
		));
	}

	return <ul className={styles["announcements"]}>{content}</ul>;
}
