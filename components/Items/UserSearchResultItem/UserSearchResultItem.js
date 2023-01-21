import Image from "next/image";
import Link from "next/link";
import styles from "./style.module.css";

const UserSearchResultItem = ({ accountName, title, avatarURL, timestamp }) => {
	const dateJoined = new Date(timestamp);
	return (
		<li className={styles.userItem}>
			<Image src={avatarURL} alt={accountName} width={65} height={65} />
			<div className="d-flex flex-column">
				<Link href={`/users/${accountName}`}>{title}</Link>
				<small
					className={
						styles.userJoinedOn
					}>{`Joined ${dateJoined.toDateString()}`}</small>
			</div>
		</li>
	);
};

export default UserSearchResultItem;
