import { Skeleton } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDiscussionByID } from "../../utilities/app-utilities";
import styles from "./style.module.css";

export default function Discussion({ id }) {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState(null);
	const [notFound, setNotFound] = useState(false);

	useEffect(() => {
		setLoading(true);
		getDiscussionByID(id)
			.then((data) => {
				const { title, body } = data;
				setData({ title, body });
				setLoading(false);
			})
			.catch(() => {
				setNotFound(true);
				setLoading(false);
			});
	}, [id]);

	const dataNotLoaded = loading === true && data === null;
	const dataLoaded = loading === false && data !== null;
	return (
		<li>
			{dataNotLoaded && (
				<div className={styles.discussion}>
					<Skeleton
						variant={"text"}
						sx={{ fontSize: "1rem", backgroundColor: "#333333" }}
						width={250}
					/>
					<Skeleton
						variant={"rounded"}
						sx={{ backgroundColor: "#333333" }}
						height={70}
					/>
				</div>
			)}
			{notFound && <span className={`${styles.discussion} text-center`}>Discussion not found!</span>}
			{dataLoaded && (
				<Link className={styles.discussion} href={`/discussions/${id}`}>
					<span className={styles["discussion-title"]}>{data.title}</span>
					<span className={styles["discussion-body"]}>{data.body}</span>
				</Link>
			)}
		</li>
	);
}
