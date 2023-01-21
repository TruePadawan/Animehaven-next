import Link from "next/link";
import styles from "./styles.module.css";

const AnimeSearchResultItem = (props) => {
	return (
		<li>
			<Link href={props.linkTo} className={styles.item}>
				<img src={props.photoURL} alt={props.title} />
				<span className={styles["item-name"]} title={props.title}>
					{props.title}
				</span>
			</Link>
		</li>
	);
};

export default AnimeSearchResultItem;
