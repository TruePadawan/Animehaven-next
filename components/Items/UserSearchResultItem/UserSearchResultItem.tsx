import Image from "next/image";
import Link from "next/link";
import styles from "./style.module.css";

interface UserSearchResultItemProps {
  accountName: string;
  title: string;
  avatarURL: string;
  timestamp: string;
}

const UserSearchResultItem = (props: UserSearchResultItemProps) => {
  const { accountName, title, avatarURL, timestamp } = props;
  const dateJoined = new Date(timestamp);
  return (
    <li>
      <Link href={`/users/${accountName}`} className={styles.userItem}>
        <Image src={avatarURL} alt={accountName} width={65} height={65} />
        <div className="d-flex flex-column">
          <span>{title}</span>
          <small
            className={styles.userJoinedOn}
          >{`Joined ${dateJoined.toDateString()}`}</small>
        </div>
      </Link>
    </li>
  );
};

export default UserSearchResultItem;
