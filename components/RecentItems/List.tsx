import { Skeleton } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getListByID } from "../../utilities/app-utilities";
import styles from "./style.module.css";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "../../database.types";

interface ListProps {
  id: number;
}

export default function List({ id }: ListProps) {
  const supabase = useSupabaseClient<Database>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ title: "", description: "" });
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    getListByID(supabase, id)
      .then((data) => {
        const { title, description } = data;
        setData({ title, description });
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, supabase]);

  return (
    <li>
      {loading && (
        <div className={styles.list}>
          <Skeleton
            variant={"text"}
            sx={{ fontSize: "1rem", backgroundColor: "#333333" }}
            width={250}
          />
          <Skeleton
            variant={"rounded"}
            sx={{ backgroundColor: "#333333" }}
            height={70}
          />
        </div>
      )}
      {notFound && <span className="text-center">List not found!</span>}
      {!notFound && (
        <Link className={styles.list} href={`/lists/${id}`}>
          <span className={styles["list-title"]}>{data.title}</span>
          <span className={styles["list-desc"]}>{data.description}</span>
        </Link>
      )}
    </li>
  );
}
