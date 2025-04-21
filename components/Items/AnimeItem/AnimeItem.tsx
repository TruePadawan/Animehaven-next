import { Skeleton, useMediaQuery } from "@mui/material";
import React, { Fragment, useRef, useState } from "react";
import Link from "next/link";
import styles from "./style.module.css";
import Image from "next/image";
import ItemPopper from "./ItemPopper";
import { parseAnime } from "../../../utilities/app-utilities";
import { Anime } from "@tutkli/jikan-ts";

interface AnimeItemProps {
  skeleton?: boolean;
  optimize?: boolean;
  anime?: Anime;
}

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

  const { anime } = props;
  const hasAnimeData = props.skeleton !== true && anime !== undefined;
  if (!hasAnimeData) {
    return (
      <li className={styles["anime-item"]}>
        <Skeleton
          variant={"rounded"}
          width="100%"
          height="100%"
          sx={{ borderRadius: "8px 8px 0 0" }}
        />
      </li>
    );
  }

  const parsedAnime = parseAnime(anime);
  return (
    <Fragment>
      <li onMouseEnter={openPopper} onMouseLeave={handleMouseLeave}>
        <Link
          href={`/anime/${parsedAnime.mal_id}`}
          className={styles["anime-item"]}
        >
          {props.optimize ? (
            <Image
              src={parsedAnime.imageURL}
              alt={parsedAnime.title}
              width={204}
              height={300}
            />
          ) : (
            <img
              src={parsedAnime.imageURL}
              alt={parsedAnime.title}
              loading="lazy"
            />
          )}
          <span className={styles.title}>{parsedAnime.title}</span>
        </Link>
      </li>
      {!matchesMobileDevice && (
        <ItemPopper
          anime={anime}
          anchorEl={anchorEl}
          onClose={closePopper}
          optimize={props.optimize}
        />
      )}
    </Fragment>
  );
};

export default AnimeItem;
