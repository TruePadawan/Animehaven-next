import { Chip, Popper } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { v4 as uuid } from "uuid";
import StarIcon from "@mui/icons-material/Star";
import styles from "./style.module.css";
import { AnimeItemData } from "../../../utilities/global.types";

interface ItemPopperProps {
  optimize?: boolean;
  onClose: VoidFunction;
  anchorEl: HTMLElement | null;
  data: AnimeItemData & {
    alt: string;
  };
}

const ItemPopper = (props: ItemPopperProps) => {
  const { data } = props;
  const open = Boolean(props.anchorEl);
  const genres = data.genres.map((genre) => {
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
  });
  if (genres.length > 3) genres.length = 3;
  const popperStyles = {
    "& > div": {
      backgroundColor: "transparent",
    },
  };
  return (
    <Popper
      anchorEl={props.anchorEl}
      open={open}
      disablePortal={true}
      placement="left"
      sx={popperStyles}
    >
      <Link
        className={styles.popover}
        onMouseLeave={props.onClose}
        href={`/anime/${data.id}`}
      >
        {props.optimize ? (
          <Image
            src={data.imageURL}
            alt={data.title}
            className={styles.popoverItemImg}
            width={200}
            height={300}
          />
        ) : (
          <img
            className={styles.popoverItemImg}
            src={data.imageURL}
            alt={data.title}
            loading="lazy"
          />
        )}

        <div className="d-flex flex-column align-self-stretch gap-1">
          <span className={styles.title}>{data.title}</span>
          <div className="d-flex justify-content-between">
            <span className={styles.score}>
              {data.score && (
                <Fragment>
                  <StarIcon sx={{ color: "goldenrod", marginBottom: "2px" }} />
                  <small>{data.score}</small>
                </Fragment>
              )}
            </span>
            <Chip
              label={data.type}
              sx={{
                color: "white",
                backgroundColor: "#616161",
                width: "max-content",
              }}
            />
          </div>
          {genres.length > 0 && (
            <div className="d-flex gap-1 flex-wrap">{genres}</div>
          )}
        </div>
      </Link>
    </Popper>
  );
};

export default ItemPopper;
