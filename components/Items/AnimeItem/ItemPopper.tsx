import { Chip, Popper } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { v4 as uuid } from "uuid";
import StarIcon from "@mui/icons-material/Star";
import styles from "./style.module.css";
import { Anime } from "@tutkli/jikan-ts";
import { parseAnime } from "../../../utilities/app-utilities";

interface ItemPopperProps {
  optimize?: boolean;
  onClose: VoidFunction;
  anchorEl: HTMLElement | null;
  anime: Anime;
}

const ItemPopper = (props: ItemPopperProps) => {
  const { anime } = props;
  const parsedAnime = parseAnime(anime);
  const open = Boolean(props.anchorEl);
  parsedAnime.genres = parsedAnime.genres.slice(3);

  return (
    <Popper
      anchorEl={props.anchorEl}
      open={open}
      disablePortal={true}
      placement="left"
      sx={{
        "& > div": {
          backgroundColor: "transparent",
        },
      }}
    >
      <Link
        className={styles.popover}
        onMouseLeave={props.onClose}
        href={`/anime/${parsedAnime.mal_id}`}
      >
        {props.optimize ? (
          <Image
            src={parsedAnime.imageURL}
            alt={parsedAnime.title}
            className={styles.popoverItemImg}
            width={200}
            height={300}
          />
        ) : (
          <img
            className={styles.popoverItemImg}
            src={parsedAnime.imageURL}
            alt={parsedAnime.title}
            loading="lazy"
          />
        )}

        <div className="d-flex flex-column align-self-stretch gap-1">
          <span className={styles.title}>{parsedAnime.title}</span>
          <div className="d-flex justify-content-between">
            <span className={styles.score}>
              {parsedAnime.score && (
                <Fragment>
                  <StarIcon sx={{ color: "goldenrod", marginBottom: "2px" }} />
                  <small>{parsedAnime.score}</small>
                </Fragment>
              )}
            </span>
            <Chip
              label={parsedAnime.type}
              sx={{
                color: "white",
                backgroundColor: "#616161",
                width: "max-content",
              }}
            />
          </div>
          {parsedAnime.genres.length > 0 && (
            <div className="d-flex gap-1 flex-wrap">
              {parsedAnime.genres.map((genre) => {
                return (
                  <Chip
                    key={uuid()}
                    variant="outlined"
                    label={genre.name}
                    sx={{
                      borderColor: "#616161",
                      color: "#B15500",
                      fontSize: "10px",
                      fontWeight: "bold",
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </Link>
    </Popper>
  );
};

export default ItemPopper;
