import { Skeleton, useMediaQuery } from "@mui/material";
import PropTypes from "prop-types";
import { Fragment, useRef, useState } from "react";
import Link from "next/link";
import styles from "./style.module.css";
import Image from "next/image";
import ItemPopover from "./ItemPopover";

const AnimeItem = (props) => {
	const [anchorEl, setAnchorEl] = useState(null);
	const mouseOverElRef = useRef(false);
	const matchesMobileDevice = useMediaQuery("(max-width: 768px)");

	const openPopover = (event) => {
		mouseOverElRef.current = true;
		const targetEl = event.currentTarget;

		setTimeout(() => {
			if (mouseOverElRef.current === true) {
				setAnchorEl(targetEl);
			}
		}, 300);
	};
	const closePopover = () => {
		setAnchorEl(null);
	};
	const handleMouseLeave = () => {
		mouseOverElRef.current = false;
	};

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
			{!props.skeleton && (
				<Fragment>
					<li onMouseEnter={openPopover} onMouseLeave={handleMouseLeave}>
						<Link href={`/anime/${props.id}`} className={styles["anime-item"]}>
							<Image
								src={props.image}
								alt={props.title}
								width={200}
								height={300}
							/>
							<span className={styles.title}>{props.title}</span>
						</Link>
					</li>
					{!matchesMobileDevice && (
						<ItemPopover
							image={props.image}
							id={props.id}
							alt={props.title}
							title={props.title}
							type={props.type}
							score={props.score}
							genres={props.genres}
							anchorEl={anchorEl}
							onClose={closePopover}
						/>
					)}
				</Fragment>
			)}
		</Fragment>
	);
};

AnimeItem.propTypes = {
	skeleton: PropTypes.bool,
	title: PropTypes.string,
	image: PropTypes.string,
	alt: PropTypes.string,
	genres: PropTypes.array,
};

export default AnimeItem;
