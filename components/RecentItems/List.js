import { Skeleton } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getListByID } from "../../utilities/app-utilities";
import styles from "./style.module.css";

export default function List({ id }) {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState({ title: "", description: ""});
	const [notFound, setNotFound] = useState(false);

	useEffect(() => {
		setLoading(true);
		getListByID(id).then((data) => {
			if (data.length > 0) {
				const { title, description } = data[0];
				setData({ title, description });
			} else {
				setNotFound(true);
			}
			setLoading(false);
		});
	}, [id]);

	const dataNotLoaded = loading === true || data.title === "";
	return (
		<li>
			{dataNotLoaded && (
				<div className={styles.list}>
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
			{notFound && <span className="text-center">List not found!</span>}
			{!notFound && (
				<Link className={styles.list} href={`/lists/${id}`}>
					<span className={styles["list-title"]}>{data.title}</span>
					<span className={styles["list-desc"]}>{data.description}</span>
				</Link>
			)}
		</li>
	);
}
