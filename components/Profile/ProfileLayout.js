import { useContext, useEffect, useState, Fragment } from "react";
import Link from "next/link";
import { IconButton, SwipeableDrawer, useMediaQuery } from "@mui/material";
import ViewSidebarIcon from "@mui/icons-material/ViewSidebar";
import Head from "next/head";
import { EditProfile } from "./ProfileSections/ProfileSections";
import { getProfileData } from "../../utilities/app-utilities";
import { UserAuthContext } from "../../context/UserAuthContext";
import styles from "./profile-layout.module.css";

export default function ProfileLayout(props) {
	const { profileID } = useContext(UserAuthContext);
	const [isAccountEditable, setIsAccountEditable] = useState(false);
	const [editProfileDialog, setShowEditProfileDialog] = useState(false);
	const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
	const matchesSmallDevice = useMediaQuery("(max-width: 768px)");
	const { profileExists } = props;

	// PROFILE CAN'T BE EDITED IF NO USER SIGNED IN OR PROFILE ISN'T SAME AS CURRENLTY SIGNED IN
	useEffect(() => {
		if (!profileExists) return;
		if (!profileID) {
			setIsAccountEditable(false);
		} else if (profileID && profileExists) {
			getProfileData("account_name", profileID).then(({ account_name }) => {
				setIsAccountEditable(account_name === props.accountName);
			});
		}
	}, [profileID, profileExists]);

	const toggleSidebar = (value) => setSidebarIsOpen(value);

	const { accountName } = props;
	const { bio, avatar_url, display_name } = props.data;

	const sidebar = (
		<aside
			className={`d-flex flex-column py-5 px-4 align-items-center ${styles.sidebar} text-white`}>
			<Link href={`/users/${accountName}`}>My Lists</Link>
			<Link href={`/users/${accountName}/discussions`}>Discussions</Link>
			<Link href={`/users/${accountName}/savedLists`}>Saved Lists</Link>
			<Link href={`/users/${accountName}/watching`}>Watching</Link>
			<Link href={`/users/${accountName}/watched`}>Watched</Link>
			<Link href={`/users/${accountName}/recommendedItems`}>Recommended</Link>
			<Link href={`/users/${accountName}/reviews`}>Reviews</Link>
			{isAccountEditable && (
				<button
					type="button"
					className={styles.editProfileBtn}
					onClick={() => setShowEditProfileDialog(true)}>
					Edit Profile
				</button>
			)}
		</aside>
	);
	return (
		<Fragment>
			{!profileExists && (
				<div className="text-white d-flex justify-content-center align-items-center flex-column h-100">
					<span className="fs-3">{`Account '${accountName}' doesn't exist`}</span>
				</div>
			)}
			{profileExists && (
				<Fragment>
					<Head>
						<title>{`Animehaven | ${display_name}`}</title>
						<meta name="description" content={bio} />
						<meta
							property="og:title"
							content={`Animehaven | ${display_name}`}
						/>
						<meta property="og:description" content={bio} />
						<meta
							property="og:url"
							content={`https://animehaven.vercel.app/users/${accountName}`}
						/>
						<meta
							name="twitter:title"
							content={`Animehaven | ${display_name}`}
						/>
						<meta name="twitter:description" content={bio} />
					</Head>
					<EditProfile
						open={editProfileDialog}
						closeDialog={() => setShowEditProfileDialog(false)}
					/>
					<div className="d-flex flex-grow-1 position-relative">
						{matchesSmallDevice && (
							<Fragment>
								<IconButton
									aria-label="Toggle Sidebar"
									sx={{ position: "absolute" }}
									className={styles["toggle-sidebar-btn"]}
									type="button"
									size="large"
									onClick={toggleSidebar.bind(this, true)}>
									<ViewSidebarIcon sx={{ color: "gray" }} fontSize="inherit" />
								</IconButton>
								<SwipeableDrawer
									anchor="left"
									PaperProps={{ sx: { backgroundColor: "#242424" } }}
									open={sidebarIsOpen}
									onOpen={toggleSidebar.bind(this, true)}
									onClose={toggleSidebar.bind(this, false)}>
									{sidebar}
								</SwipeableDrawer>
							</Fragment>
						)}
						{!matchesSmallDevice && sidebar}
						<main className="d-flex flex-column flex-grow-1 p-2 mw-100">
							<div className="d-flex flex-column align-items-center gap-1 p-4 text-white">
								<img
									src={avatar_url}
									alt="profile pic"
									className={styles.photo}
								/>
								<div className="d-flex flex-column align-items-center">
									<span className="fs-4">{display_name}</span>
									<span
										className={styles.accountName}>{`@${accountName}`}</span>
								</div>
								<span className={styles.bio}>{bio}</span>
							</div>
							{props.children}
						</main>
					</div>
				</Fragment>
			)}
		</Fragment>
	);
}