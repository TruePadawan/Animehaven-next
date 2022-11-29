import { Skeleton } from "@mui/material";
import Link from "next/link";
import PropTypes from "prop-types";
import styles from "./announcementItem.module.css";

const AnnouncementItem = ({ id, title, body, isDataLoaded = true }) => {
	return (
		<li>
			{!isDataLoaded && (
				<div className={styles["announcement-item"]}>
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
			{isDataLoaded && (
				<Link
					href={`/discussions/${id}`}
					className={styles["announcement-item"]}>
					<span className={styles["title"]}>{title}</span>
					<span className={styles["body"]}>{body}</span>
				</Link>
			)}
		</li>
	);
};

AnnouncementItem.propTypes = {
	id: PropTypes.string,
	title: PropTypes.string,
	body: PropTypes.string,
	isDataLoaded: PropTypes.bool,
};

export default AnnouncementItem;
