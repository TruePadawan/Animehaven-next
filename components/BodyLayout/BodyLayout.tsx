import Section from "../Section/Section";
import styles from "./styles.module.css";
import { useContext } from "react";
import { UserAuthContext } from "../../context/authentication/UserAuthContext";
import { Box, useMediaQuery } from "@mui/material";
import Announcements from "./Announcements";
import Recent from "./Recent";
import { BodyLayoutProps } from "./types/BodyLayout.types";

const BodyLayout = (props: BodyLayoutProps) => {
  const { profileID } = useContext(UserAuthContext);
  const showSideSection = useMediaQuery("(min-width:1200px)");
  const { children, className, recentItems = "animes" } = props;

  return (
    <div className={styles["page-container"]}>
      <Box component="main" sx={{ minWidth: "0" }} className={className}>
        {children}
      </Box>
      {showSideSection && (
        <aside className={styles["side"]}>
          <Section
            title={"Announcements"}
            className={styles["announcements-section"]}
          >
            <Announcements />
          </Section>
          {profileID && (
            <Section title={"Recent"} className={styles["recent-section"]}>
              <Recent type={recentItems} profileID={profileID} />
            </Section>
          )}
        </aside>
      )}
    </div>
  );
};

export default BodyLayout;
