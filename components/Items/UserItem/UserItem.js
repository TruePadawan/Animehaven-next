import Link from "next/link";
import styles from "./style.module.css";

const UserItem = ({ accountName, title, avatarURL, timestamp }) => {
    const dateJoined = new Date(timestamp);
    return (
      <li className={styles.userItem}>
        <img src={avatarURL} alt={accountName} />
        <div className="d-flex flex-column">
          <Link href={`/users/${accountName}`}>{title}</Link>
          <small className={styles.userJoinedOn}>{`Joined ${dateJoined.toDateString()}`}</small>
        </div>
      </li>
    );
};

export default UserItem;