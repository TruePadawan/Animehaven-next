import { Box, Tab, Tabs, useMediaQuery } from "@mui/material";
import styles from "./header.module.css";
import { useRouter } from "next/router";
import Authentication from "../Authentication/Authentication";
import { SyntheticEvent, useEffect, useState } from "react";
import Link from "next/link";

interface AvailableRoutes {
  [key: string]: number;
}

const Header = () => {
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const matchesSmallDevice = useMediaQuery("(max-width:480px)");
  const routes: AvailableRoutes = { discussions: 1, lists: 2, search: 3 };

  useEffect(() => {
    const getTabValue = () => {
      if (router.isReady) {
        const currentRoute = router.pathname.split("/").at(1) ?? "";
        if (currentRoute === "") return 0;
        if (routes[currentRoute] === undefined) return 4;
        else return routes[currentRoute];
      }
      return 0;
    };

    setTabValue(getTabValue());
  }, [router]);

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const headerContent = matchesSmallDevice ? (
    <img
      src="/logo.png"
      alt="animehaven"
      width={50}
      height={50}
      className={styles.headerImg}
    />
  ) : (
    <h1>Animehaven</h1>
  );

  const currentRoute = router.pathname.split("/").at(1);
  const isAtProfilePage = currentRoute === "users";
  const isAtAnimeDetailsPage = currentRoute === "anime";
  const isAtSignupPage = router.route === "/signup";
  const isAtSigninPage = router.route === "/signin";

  const tabsStyles = {
    width: "100%",
    "& .MuiTabs-indicator": {
      backgroundColor: "darkgrey",
    },
  };
  return (
    <header className={styles.header}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "5px",
        }}
      >
        <Link className={styles.heading} href="/">
          {headerContent}
        </Link>
        <Authentication />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignContent: "center",
        }}
      >
        <Tabs
          sx={tabsStyles}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          value={tabValue}
          onChange={handleTabChange}
        >
          <NavTab href="/" label="Home" />
          <NavTab href="/discussions" label="Discussions" />
          <NavTab href="/lists" label="Lists" />
          <NavTab href="/search" label="Search" />
          {isAtProfilePage && (
            <NavTab
              href={router.query.accountName?.toString() ?? ""}
              label="Profile"
            />
          )}
          {isAtAnimeDetailsPage && (
            <NavTab
              href={router.query.animeID?.toString() ?? ""}
              label="Anime"
            />
          )}
          {isAtSignupPage && <NavTab href={"/signup"} label="Sign Up" />}
          {isAtSigninPage && <NavTab href={"/signin"} label="Sign In" />}
        </Tabs>
      </Box>
    </header>
  );
};

interface NavTabProps {
  href: string;
  label: string;
}

const NavTab = (props: NavTabProps) => {
  const tabStyles = {
    color: "gray",
    "&:hover": {
      color: "darkgray",
    },
    "&.Mui-selected": {
      color: "whitesmoke",
    },
  };

  return <Tab sx={tabStyles} component={Link} {...props} />;
};

export default Header;
