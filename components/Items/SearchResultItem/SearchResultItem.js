import Link from "next/link";
import styles from "./styles.module.css";

const SearchResultItem = (props) => {
  return (
    <div className={styles.item}>
      <img src={props.photoURL} alt={props.title} />
      <span className={styles["item-name"]} title={props.title}>
        {props.type === "item" ? (
          <Link href={`/anime/${props.itemID}`}>{props.title}</Link>
        ) : (
          <Link href={`/users/${props.accountName}`}>{props.title}</Link>
        )}
      </span>
      {props.children && props.children}
    </div>
  );
};

export default SearchResultItem;