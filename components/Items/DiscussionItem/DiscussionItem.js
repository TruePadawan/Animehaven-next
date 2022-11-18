import { Skeleton } from "@mui/material";
import PropTypes from "prop-types";
import Link from "next/link";
import styles from "./style.module.css";

export default function DiscussionItem({id, title, author, dataLoaded }) {
    author = author.toLowerCase();

    return (
      <li className={styles["discussion-item"]}>
        {dataLoaded ? (
          <>
            <Link href={`/discussions/${id}`} className={styles.title}>{title}</Link>
            <small className={styles.author}>
              Opened by{" "}
              <Link href={`/users/${author}`}>
                {author}
              </Link>
            </small>
          </>
        ) : (
          <>
            <Skeleton variant={"text"} sx={{ fontSize: '1rem', backgroundColor: '#333333' }} width={500} />
            <Skeleton variant={"text"} sx={{ fontSize: '0.8rem', backgroundColor: '#333333' }} width={100} />
          </>
        )
        }
      </li>
    );
}

DiscussionItem.propTypes = {
    id: PropTypes.string,
    dataLoaded: PropTypes.bool,
    title: PropTypes.string,
    author: PropTypes.string
}