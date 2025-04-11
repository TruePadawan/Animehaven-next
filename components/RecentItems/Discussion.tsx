import {Skeleton} from "@mui/material";
import Link from "next/link";
import {useEffect, useState} from "react";
import {getDiscussionByID} from "../../utilities/app-utilities";
import styles from "./style.module.css";
import {useSupabaseClient} from "@supabase/auth-helpers-react";
import {Database, Tables} from "../../database.types";

interface DiscussionProps {
    id: string;
}

export default function Discussion({id}: DiscussionProps) {
    const supabase = useSupabaseClient<Database>();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({title: "", body: ""});
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        setLoading(true);
        getDiscussionByID(supabase, id)
            .then((discussion: Tables<"discussions">) => {
                const {title, body} = discussion;
                setData({title, body});
                setLoading(false);
            })
            .catch(() => {
                setNotFound(true);
                setLoading(false);
            });
    }, [id, supabase]);

    const dataNotLoaded = loading && data === null;
    const dataLoaded = !loading && data !== null;
    return (
        <li>
            {dataNotLoaded && (
                <div className={styles.discussion}>
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
            {notFound && <span className={`${styles.discussion} text-center`}>Discussion not found!</span>}
            {dataLoaded && (
                <Link className={styles.discussion} href={`/discussions/${id}`}>
                    <span className={styles["discussion-title"]}>{data.title}</span>
                    <span className={styles["discussion-body"]}>{data.body}</span>
                </Link>
            )}
        </li>
    );
}
