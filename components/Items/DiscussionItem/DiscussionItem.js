import PropTypes from "prop-types";
import Link from "next/link";
import styles from "./style.module.css";
import { useEffect, useState } from "react";
import { getProfileData } from "../../../utilities/app-utilities";
import { Skeleton } from "@mui/material";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function DiscussionItem(props) {
	const supabase = useSupabaseClient();
	const [creatorAcctName, setCreatorAcctName] = useState("");

	useEffect(() => {
		const { creatorID } = props;
		getProfileData(supabase, "account_name", creatorID).then((data) => {
			setCreatorAcctName(data.account_name);
		});
	}, [props, supabase]);

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

DiscussionItem.propTypes = {
	id: PropTypes.number,
	title: PropTypes.string,
	creatorID: PropTypes.string,
	tag: PropTypes.string,
};
