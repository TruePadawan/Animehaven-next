import { Grid, Skeleton } from "@mui/material";
import { useEffect, useState } from "react";
import { getAnimeByID } from "../../../utilities/mal-api";
import { getUsefulData } from "../../../utilities/app-utilities";
import Link from "next/link";
import styles from "./style.module.css";

const RecommendedItem = ({ itemID, index }) => {
  const [loading, setLoading] = useState(true);
  const [itemData, setItemData] = useState({ title: "", photoSrc: "" });

  useEffect(() => {
    // LAZY REQEUST DUE TO RATE LIMITING
		const timeout = index > 0 ? index * 700 : 0;
    const getData = async () => {
      const data = await getAnimeByID(itemID);
      const { title, imageURL } = getUsefulData(data);
      setItemData({
        title,
        photoSrc: imageURL,
      });
      setLoading(false);
    }
    setTimeout(() => {
      getData();
    }, timeout);
  }, [itemID, index]);

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
            <img src={itemData.photoSrc} alt={itemData.title} />
            <span className={styles.title} title={itemData.title}>
              <Link href={`/anime/${itemID}`}>{itemData.title}</Link>
            </span>
          </div>
        )}
      </Grid>
    );
};

export default RecommendedItem;