import { useContext, useEffect, useState, Fragment } from "react";
import Link from "next/link";
import { IconButton, SwipeableDrawer, useMediaQuery } from "@mui/material";
import ViewSidebarIcon from "@mui/icons-material/ViewSidebar";
import Head from "next/head";
import { EditProfile } from "./ProfileSections/ProfileSections";
import { getProfileData, getProfileID } from "../../utilities/app-utilities";
import { UserAuthContext } from "../../context/UserAuthContext";
import styles from "./profile-layout.module.css";
import Loading from "../Loading/Loading";
import NoAccount from "../NoAccount/NoAccount";

export default function ProfileLayout(props) {
	const { profileID } = useContext(UserAuthContext);
	const [profileData, setProfileData] = useState({
		profileExists: null,
		accountName: null,
		data: {},
	});
	const [isAccountEditable, setIsAccountEditable] = useState(false);
	const [editProfileDialog, setShowEditProfileDialog] = useState(false);
	const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
	const matchesSmallDevice = useMediaQuery("(max-width: 768px)");
	const { router } = props;

	// CONFIRM THAT PROFILE EXISTS THEN RETRIEVE ITS DATA
	useEffect(() => {
		if (router.isReady) {
			const { accountName } = router.query;
			getProfileID(accountName).then((id) => {
				if (id === null) {
					setProfileData({
						profileExists: false,
						accountName,
						data: {},
					});
				} else {
					getProfileData("*", id).then(({ avatar_url, display_name, bio }) => {
						setProfileData({
							profileExists: true,
							accountName,
							data: {
								avatar_url,
								display_name,
								bio,
							},
						});
					});
				}
			});
		}
	}, [router]);

	// PROFILE CAN'T BE EDITED IF NO USER SIGNED IN OR PROFILE ISN'T SAME AS CURRENLTY SIGNED IN
	useEffect(() => {
		const { profileExists, accountName } = profileData;
		if (!profileExists) return;

		if (!profileID) {
			setIsAccountEditable(false);
		} else if (profileID && profileExists) {
			getProfileData("account_name", profileID).then(({ account_name }) => {
				setIsAccountEditable(account_name === accountName);
			});
		}
	}, [profileID, profileData]);

	function toggleSidebar(value) {
		setSidebarIsOpen(value);
	}

	const { profileExists } = profileData;
	const loading = profileExists === null;
	if (loading) {
		return <Loading />;
	}

	const { accountName } = router.query;
	const { bio, avatar_url, display_name } = profileData.data;
	const sidebar = (
		<aside
			className={`d-flex flex-column py-5 px-4 align-items-center ${styles.sidebar} text-white`}>
			<Link href={`/users/${accountName}`}>My Lists</Link>
			<Link href={`/users/${accountName}/discussions`}>Discussions</Link>
			<Link href={`/users/${accountName}/savedLists`}>Saved Lists</Link>
			<Link href={`/users/${accountName}/watching`}>Watching</Link>
			<Link href={`/users/${accountName}/watched`}>Watched</Link>
			<Link href={`/users/${accountName}/recommended`}>Recommended</Link>
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
				<NoAccount accountName={accountName} />
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
									title="Toggle Sidebar"
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
									width={150}
									height={150}
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
