import { Grid, Skeleton } from "@mui/material";
import { useEffect, useState } from "react";
import { getAnimeById } from "../../../utilities/mal-api";
import { parseAnime } from "../../../utilities/app-utilities";
import Link from "next/link";
import styles from "./style.module.css";

interface RecommendedItemProps {
  itemId: string;
  index: number;
}

const RecommendedItem = ({ itemId, index }: RecommendedItemProps) => {
  const [loading, setLoading] = useState(true);
  const [itemData, setItemData] = useState({ title: "", photoSrc: "" });

  useEffect(() => {
    // LAZY REQEUST DUE TO RATE LIMITING
    const timeout = index > 0 ? index * 700 : 0;
    const getData = async () => {
      const data = await getAnimeById(+itemId);
      const { title, imageURL } = parseAnime(data);
      setItemData({
        title,
        photoSrc: imageURL,
      });
      setLoading(false);
    };
    setTimeout(() => {
      getData();
    }, timeout);
  }, [itemId, index]);

  return (
    <Grid item>
      {loading && (
        <div className={`p-1 d-flex flex-column gap-1`}>
          <Skeleton variant="rounded" width={120} height={170} />
          <Skeleton sx={{ fontSize: "0.8rem", width: "100px" }} />
        </div>
      )}
      {!loading && (
        <div className={styles.item}>
          <img
            src={itemData.photoSrc}
            alt={itemData.title}
            width={120}
            height={170}
            loading="lazy"
          />
          <span className={styles.title} title={itemData.title}>
            <Link href={`/anime/${itemId}`}>{itemData.title}</Link>
          </span>
        </div>
      )}
    </Grid>
  );
};

export default RecommendedItem;
