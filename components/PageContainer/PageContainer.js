import Section from "../Section/Section";
import styles from "./pagecontainer.module.css";
import { useContext } from "react";
import { UserAuthContext } from "../../context/UserAuthContext";
import { Box, useMediaQuery } from "@mui/material";
import Announcements from "./Announcements";
// const ALLOWED_RECENT_ITEMS = ["animes", "lists", "discussions"];

const PageContainer = ({ children, className, recentItems = "animes" }) => {
	const { profileID } = useContext(UserAuthContext);
	const showSideSection = useMediaQuery("(min-width:1200px)");
	return (
		<div className={styles["page-container"]}>
			<Box component="main" sx={{ minWidth: "0" }} className={className}>
				{children}
			</Box>
			{showSideSection && (
				<aside className={styles["side"]}>
					<Section
						title={"Announcements"}
						className={styles["announcements-section"]}>
						<Announcements />
					</Section>
					{profileID && (
						<Section
							title={"Recent"}
							className={styles["recent-section"]}></Section>
					)}
				</aside>
			)}
		</div>
	);
};

export default PageContainer;
