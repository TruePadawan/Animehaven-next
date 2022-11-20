import { Box, Tab, Tabs, useMediaQuery } from "@mui/material";
import styles from "./header.module.css";
import { useRouter } from "next/router";
import Authentication from "./components/Authentication/Authentication";
import HeaderLogo from "../../assets/logo.png";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

const NavTab = ({ children, ...props }) => {
	const tabStyles = {
		color: "gray",
		"&:hover": {
			color: "darkgray"
		},
		"&.Mui-selected": {
			color: "whitesmoke"
		}
	};

	return (
		<Tab sx={tabStyles} component={Link} label={children} {...props} />
	);
};

const routes = { discussions: 1, lists: 2, search: 3, users: 4, anime: 4 };

const getTabValue = (router) => {
	if (router.isReady) {
		const currentRoute = router.pathname.split("/").at(1);
		if (currentRoute === "") return 0;
		return routes[currentRoute];
	}
	return 0;
};

const Header = () => {
	const router = useRouter();
	const [tabValue, setTabValue] = useState(0);
	const matchesSmallDevice = useMediaQuery("(max-width:480px)");

	useEffect(() => {
		setTabValue(getTabValue(router));
	}, [router]);

	const handleTabChange = (event, newValue) => {
		setTabValue(newValue);
	};

	const headerContent = matchesSmallDevice ? (
		<Image src={HeaderLogo} alt="animehaven" width={50} height={50} className={styles.headerImg} />
	) : (
		<h1>Animehaven</h1>
	);
	
	const currentRoute = router.pathname.split("/").at(1);
	const isAtProfilePage = currentRoute === "users";
	const isAtAnimeDetailsPage = currentRoute === "anime";

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
				}}>
				<Link className={styles.heading} href="/">{headerContent}</Link>
				<Authentication />
			</Box>
			<Box
				sx={{
					display: "flex",
					justifyContent: "flex-start",
					alignContent: "center",
				}}>
				<Tabs
					sx={tabsStyles}
					variant="scrollable"
					scrollButtons="auto"
					allowScrollButtonsMobile
					value={tabValue}
					onChange={handleTabChange}>
					<NavTab href="/">Home</NavTab>
					<NavTab href="/discussions">Discussions</NavTab>
					<NavTab href="/lists">Lists</NavTab>
					<NavTab href="/search">Search</NavTab>
					{isAtProfilePage && (
						<NavTab href={router.query.accountName || ""}>Profile</NavTab>
					)}
					{isAtAnimeDetailsPage && (
						<NavTab href={router.query.animeID || ""}>Anime</NavTab>
					)}
				</Tabs>
			</Box>
		</header>
	);
};

export default Header;
