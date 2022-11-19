import { Chip, Popper } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { v4 as uuid } from "uuid";
import starIcon from "../../../assets/star.png";
import styles from "./style.module.css";

const ItemPopper = (props) => {
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
	const popperStyles = {
		"& > div": {
			backgroundColor: "transparent",
		},
	};
	return (
		<Popper
			anchorEl={props.anchorEl}
			open={open}
			onClose={props.onClose}
			disablePortal={true}
			placement="left"
			sx={popperStyles}>
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
					<span className={styles.title}>{props.title}</span>
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
