import Section from "../Section/Section";
import AnnouncementItem from "../Items/AnnouncementItem/AnnouncementItem";
import styles from "./pagecontainer.module.css";
import { useContext } from "react";
import { UserAuthContext } from "../../context/UserAuthContext";
import { Box, useMediaQuery } from "@mui/material";

const PageContainer = ({children, className}) => {
  const { profileID }= useContext(UserAuthContext);
  const showSideSection = useMediaQuery("(min-width:1200px)");
    return (
      <div className={styles["page-container"]}>
        <Box component="main" sx={{ minWidth: "0" }} className={className}>{children}</Box>
        {showSideSection && (
          <aside className={styles["side"]}>
            <Section title={"Announcements"} className={styles["announcements-section"]}>
              <ul className={styles["announcements"]}>
                <AnnouncementItem isDataLoaded={false} />
                <AnnouncementItem
                  title="New Award System"
                  body={
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                  }
                />
                <AnnouncementItem isDataLoaded={false} />
              </ul>
            </Section>
            {profileID && <Section title={"Recent"} className={styles["recent-section"]}></Section>}
          </aside>
        )}
      </div>
    );
}

export default PageContainer;