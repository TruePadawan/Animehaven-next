import { Skeleton, useMediaQuery } from "@mui/material";
import React, { Fragment, useRef, useState } from "react";
import Link from "next/link";
import styles from "./style.module.css";
import Image from "next/image";
import ItemPopper from "./ItemPopper";
import { AnimeItemProps } from "./AnimeItem.types";

const AnimeItem = (props: AnimeItemProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const mouseOverElRef = useRef(false);
  const matchesMobileDevice = useMediaQuery("(max-width: 1024px)");

  const openPopper = (event: React.MouseEvent<HTMLLIElement>) => {
    mouseOverElRef.current = true;
    const targetEl = event.currentTarget;

    setTimeout(() => {
      if (mouseOverElRef.current) {
        setAnchorEl(targetEl);
      }
    }, 300);
  };
  const closePopper = () => {
    setAnchorEl(null);
  };
  const handleMouseLeave = () => {
    mouseOverElRef.current = false;
    setAnchorEl(null);
  };

  const { data } = props;
  const hasAnimeData = props.skeleton !== true && data !== undefined;
  return (
    <Fragment>
      {props.skeleton && (
        <li className={styles["anime-item"]}>
          <Skeleton
            variant={"rounded"}
            width="100%"
            height="100%"
            sx={{ borderRadius: "8px 8px 0 0" }}
          />
        </li>
      )}
      {hasAnimeData && (
        <Fragment>
          <li onMouseEnter={openPopper} onMouseLeave={handleMouseLeave}>
            <Link href={`/anime/${data.id}`} className={styles["anime-item"]}>
              {props.optimize ? (
                <Image
                  src={data.imageURL}
                  alt={data.title}
                  width={204}
                  height={300}
                />
              ) : (
                <img src={data.imageURL} alt={data.title} loading="lazy" />
              )}
              <span className={styles.title}>{data.title}</span>
            </Link>
          </li>
          {!matchesMobileDevice && (
            <ItemPopper
              data={{
                ...data,
                alt: data.title,
              }}
              anchorEl={anchorEl}
              onClose={closePopper}
              optimize={props.optimize}
            />
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

export default AnimeItem;
