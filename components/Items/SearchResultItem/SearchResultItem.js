import Link from "next/link";
import Image from "next/image";
import styles from "./styles.module.css";

const SearchResultItem = (props) => {
  return (
    <div className={styles.item}>
      <Image src={props.photoURL} alt={props.title} width={100} height={100} />
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