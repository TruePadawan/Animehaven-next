import { Chip, Popover, Skeleton, Tooltip, Zoom } from "@mui/material";
import PropTypes from "prop-types";
import { useRef, useState } from "react";
import starIcon from "../../../assets/star.png";
import { v4 as uuid } from "uuid";
import Link from "next/link";
import styles from "./style.module.css";
import Image from "next/image";

const ItemPopover = (props) => {
	const open = Boolean(props.anchorEl);
	const genres = props.genres.map((genre) => {
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

	return (
		<Popover
			anchorEl={props.anchorEl}
			open={open}
			onClose={props.onClose}
			sx={{
				"& > div": {
					backgroundColor: "transparent",
				},
			}}>
			<Link
				className={styles.popover}
				onMouseLeave={props.onClose}
				href={`/anime/${props.id}`}>
				<Image
					src={props.image}
					alt={props.title}
					className={styles.popoverItemImg}
					width={200}
					height={300}
				/>
				<div className="d-flex flex-column align-self-stretch gap-1">
					<Tooltip title={props.title} TransitionComponent={Zoom}>
						<span className={styles.title}>{props.title}</span>
					</Tooltip>
					<div className="d-flex justify-content-between">
						<span className={styles.score}>
							{props.score && (
								<>
									<img src={starIcon.src} alt="star" />
									<small>{props.score}</small>
								</>
							)}
						</span>
						<Chip
							label={props.type}
							sx={{
								color: "white",
								backgroundColor: "#616161",
								fontWeight: "bold",
								width: "60px",
							}}
						/>
					</div>
					{genres.length > 0 && (
						<div className="d-flex gap-1 flex-wrap">{genres}</div>
					)}
				</div>
			</Link>
		</Popover>
	);
};

const AnimeItem = (props) => {
	const [anchorEl, setAnchorEl] = useState(null);
	const mouseOverElRef = useRef(false);

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
		<>
			{props.skeleton && (
				<li className={styles["anime-item"]}>
					<Skeleton
						variant={"rounded"}
						width="100%"
						height="100%"
						sx={{ borderRadius: "8px 8px 0 0" }}
					/>
					{/* <Skeleton width={120} sx={{ fontSize: "1rem" }} /> */}
				</li>
			)}
			{!props.skeleton && (
				<>
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
				</>
			)}
		</>
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
