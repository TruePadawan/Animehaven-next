import Loading from "../Loading/Loading";
import useSWRImmutable from "swr/immutable";
import AnnouncementItem from "../Items/AnnouncementItem/AnnouncementItem";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import styles from "./styles.module.css";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

async function announcementsFetcher(supabase, tag) {
	const { data } = await supabase
		.from("discussions")
		.select()
		.eq("tag", tag)
		.limit(3)
		.throwOnError();
	return data;
}

export default function Announcements() {
	const supabase = useSupabaseClient();
	const { data, error } = useSWRImmutable([supabase, "announcement"], announcementsFetcher);

	const loading = !data && !error;
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
