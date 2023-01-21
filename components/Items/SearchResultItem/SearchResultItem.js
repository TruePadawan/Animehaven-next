import Link from "next/link";
import styles from "./styles.module.css";

const SearchResultItem = (props) => {
	return (
		<Link href={props.linkTo} className={styles.item}>
			<img src={props.photoURL} alt={props.title} />
			<span className={styles["item-name"]} title={props.title}>
				{props.title}
			</span>
		</Link>
	);
};

export default SearchResultItem;
