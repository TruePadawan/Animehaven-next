import Link from "next/link";
import { Fragment } from "react";
import styles from "../Comments-Reviews.module.css";

const Reply = (props) => {
	return (
		<div className={styles["referenced-comment"]}>
			{props.isDeleted && (
				<span
					className={`${styles["referenced-comment-text"]} text-center w-100`}>
					Comment no longer exists
				</span>
			)}
			{!props.isDeleted && (
				<Fragment>
					<Link className={styles["creator-name"]} href={props.profileLink}>
						{props.creatorName}
					</Link>
					<span className={styles["referenced-comment-text"]}>
						{props.commentText}
					</span>
				</Fragment>
			)}
		</div>
	);
};

export default Reply;
