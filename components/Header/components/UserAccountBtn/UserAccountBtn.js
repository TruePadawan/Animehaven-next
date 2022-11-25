import { Fragment, useEffect, useState } from "react";
import {
	Menu,
	MenuItem,
	IconButton,
	Avatar,
	CircularProgress,
} from "@mui/material";
import Link from "next/link";
import { DEFAULT_AVATAR_URL } from "../../../../utilities/app-utilities";
import { supabase } from "../../../../supabase/config";
import { getProfileData } from "../../../../utilities/app-utilities";
import Image from "next/image";

const UserAccountBtn = ({ profileID, errorHandler }) => {
	const [accountName, setAccountName] = useState("");
	const [menuAnchorEl, setMenuAnchorEl] = useState(null);
	const [photoSrc, setPhotoSrc] = useState(DEFAULT_AVATAR_URL);
	const [loading, setLoading] = useState(true);
	const isMenuOpen = Boolean(menuAnchorEl);

	useEffect(() => {
		getProfileData("*", profileID).then(({ account_name, avatar_url }) => {
			setAccountName(account_name);
			setPhotoSrc(avatar_url);
			setLoading(false);
		});
	}, [profileID]);

	const openMenu = (e) => {
		setMenuAnchorEl(e.currentTarget);
	};

	const closeMenu = () => {
		setMenuAnchorEl(null);
	};

	const signUserOut = () => {
		setLoading(true);
		supabase.auth
			.signOut()
			.then(() => {
				setLoading(false);
				window.location.reload();
			})
			.catch((error) => {
				errorHandler("Failed to signout!", error);
			});
	};

	return (
		<Fragment>
			{!loading && (
				<Fragment>
					<IconButton
						onClick={openMenu}
						aria-controls={isMenuOpen ? "account-menu" : undefined}
						aria-haspopup="true"
						aria-expanded={isMenuOpen ? "true" : undefined}>
						<Avatar alt={accountName} sx={{ color: "black" }}>
							<Image
								style={{ objectFit: "contain" }}
								src={photoSrc}
								alt={accountName}
								width={100}
								height={100}
								quality={100}
								title="Account"
							/>
						</Avatar>
					</IconButton>
					<Menu
						id="account-menu"
						anchorEl={menuAnchorEl}
						open={isMenuOpen}
						onClick={closeMenu}
						PaperProps={{
							sx: {
								backgroundColor: "#121212",
								color: "white",
							},
						}}>
						<MenuItem className="font-rubik">
							<Link href={`/users/${accountName}`}>My Profile</Link>
						</MenuItem>
						<MenuItem className="font-rubik" onClick={signUserOut}>
							Sign Out
						</MenuItem>
					</Menu>
				</Fragment>
			)}
			{loading && <CircularProgress sx={{ color: "goldenrod" }} />}
		</Fragment>
	);
};

export default UserAccountBtn;
