import Image from "next/image";
import Link from "next/link";
import styles from "./style.module.css";

const UserSearchResultItem = ({ accountName, title, avatarURL, timestamp }) => {
	const dateJoined = new Date(timestamp);
	return (
		<li>
			<Link href={`/users/${accountName}`} className={styles.userItem}>
				<Image src={avatarURL} alt={accountName} width={65} height={65} />
				<div className="d-flex flex-column">
					<span href={`/users/${accountName}`}>{title}</span>
					<small
						className={
							styles.userJoinedOn
						}>{`Joined ${dateJoined.toDateString()}`}</small>
				</div>
			</Link>
		</li>
	);
};

export default UserSearchResultItem;
