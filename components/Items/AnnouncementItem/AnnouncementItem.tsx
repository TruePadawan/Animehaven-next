import {Skeleton} from "@mui/material";
import Link from "next/link";
import styles from "./announcementItem.module.css";
import {AnnouncementItemProps} from "./AnnouncementItem.types";

const AnnouncementItem = (props: AnnouncementItemProps) => {
    const {id, title, body, isDataLoaded = true} = props;

    return (
        <li>
            {!isDataLoaded && (
                <div className={styles["announcement-item"]}>
                    <Skeleton
                        variant={"text"}
                        sx={{fontSize: "1rem", backgroundColor: "#333333"}}
                        width={250}
                    />
                    <Skeleton
                        variant={"rounded"}
                        sx={{backgroundColor: "#333333"}}
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

export default AnnouncementItem;
