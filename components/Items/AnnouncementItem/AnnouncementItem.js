import { Skeleton } from "@mui/material";
import PropTypes from "prop-types";
import styles from "./announcementItem.module.css";

const AnnouncementItem = ({title, body, isDataLoaded = true}) => {
    return (
      <li className={styles["announcement-item"]}>
        {isDataLoaded ? (
          <>
            <span className={styles["title"]}>{title}</span>
            <span className={styles["body"]}>{body}</span>
          </>
        ) : (
            <>
                <Skeleton variant={"text"} sx={{ fontSize: '1rem', backgroundColor: '#333333' }} width={250} />
                <Skeleton variant={"rounded"} sx={{ backgroundColor: '#333333' }} height={70} />
            </>
        )}
      </li>
    );
}

AnnouncementItem.propTypes = {
    title: PropTypes.string,
    body: PropTypes.string,
    isDataLoaded: PropTypes.bool
}

export default AnnouncementItem;