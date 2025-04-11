import Link from "next/link";
import styles from "./style.module.css";

interface AnimeProps {
    id: number;
    imgSrc: string;
    label: string;
    synopsis: string;
}

export default function Anime(props: AnimeProps) {
    return (
        <li>
            <Link className={styles.anime} href={`/anime/${props.id}`}>
                <img src={props.imgSrc} alt={props.label} width={71} height={100}/>
                <div className="d-flex flex-column">
                    <span className="text-black">{props.label}</span>
                    <span className={styles.synopsis}>{props.synopsis}</span>
                </div>
            </Link>
        </li>
    );
}
