import PropTypes from "prop-types";
import styles from "./section.module.css";
import { IconButton } from "@mui/material";
import CachedIcon from "@mui/icons-material/Cached";
import {SectionProps} from "./Section.types";

const Section = (props: SectionProps) => {
	const className = `${styles["section"]} ${props.className || ""}`;
	return (
		<section aria-labelledby={props.headingId} className={className}>
			<div className="d-flex justify-content-between align-items-center">
				<h2 id={props.headingId} className={styles["section-title"]}>
					{props.title}
				</h2>
				{props.refreshable && (
					<IconButton
						aria-label="Refresh"
						title="Refresh"
						onClick={props.onBtnClick}
						sx={{ color: "white" }}>
						<CachedIcon />
					</IconButton>
				)}
			</div>
			{props.children}
		</section>
	);
};

export default Section;
