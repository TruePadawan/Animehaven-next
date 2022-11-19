import { PhotoCamera } from "@mui/icons-material";
import { Masonry } from "@mui/lab";
import { Box, IconButton, Modal } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useContext, useEffect, useRef, useState } from "react";
import DiscussionItem from "../../../components/Items/DiscussionItem/DiscussionItem";
import ListItem from "../../../components/Items/ListItem/ListItem";
import RecommendedItem from "../../../components/Items/RecommendedItem/RecommendedItem";
import ReviewItem from "../../../components/Items/ReviewItem/ReviewItem";
import Loading from "../../../components/Loading/Loading";
import { UserAuthContext } from "../../../context/UserAuthContext";
import styles from "./ProfileSections.module.css";
import {
	DEFAULT_AVATAR_URL,
	getUserItemRecommendations,
	getUserItemReviews,
} from "../../../utilities/app-utilities";
import { getProfileID, getProfileData } from "../../../utilities/app-utilities";
import { supabase } from "../../../supabase/config";
import { useRouter } from "next/router";
import Image from "next/image";

const ProfileSectionContainer = ({ title, children }) => {
	return (
		<section
			className={`text-white`}
			aria-labelledby="section-head"
			style={{ flexGrow: 1 }}>
			<h5 id="section-head" className={styles.sectionHead}>
				{title}
			</h5>
			{children}
		</section>
	);
};

export function UserDiscussions() {
	return (
		<ProfileSectionContainer title="Discussions">
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100%",
				}}>
				<p>COMING SOON</p>
			</Box>
		</ProfileSectionContainer>
	);
}

export function UserLists({ accountName }) {
	const [lists, setLists] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getProfileID(accountName).then((id) => {
			supabase
				.from("lists")
				.select("id")
				.eq("creator_id", id)
				.throwOnError()
				.then(
					({ data: listsData }) => {
						const lists = listsData.map((list) => {
							return <ListItem key={list.id} listID={list.id} />;
						});
						setLists(lists);
						setLoading(false);
					},
					(error) => {
						console.error(error);
						setLists([]);
						setLoading(false);
					}
				);
		});
	}, [accountName]);

	return (
		<ProfileSectionContainer title="Lists">
			{loading && <Loading />}
			{!loading && (
				<Masonry
					columns={{ xs: 1, sm: 2, lg: 3, xl: 4 }}
					spacing={1}
					sx={{ marginTop: "5px" }}>
					{lists}
				</Masonry>
			)}
		</ProfileSectionContainer>
	);
}

export function UserSavedLists({ accountName }) {
	const [loading, setLoading] = useState(true);
	const [items, setItems] = useState([]);

	useEffect(() => {
		setLoading(true);
		supabase
			.rpc("get_saved_lists", { acct_name: accountName })
			.throwOnError()
			.then(({ data }) => {
				const transformed = data.map((list) => {
					return <ListItem key={list.id} listID={list.id} />;
				});
				setItems(transformed);
				setLoading(false);
			});
	}, [accountName]);

	return (
		<ProfileSectionContainer title="Saved Lists">
			{loading && <Loading />}
			{!loading && (
				<Masonry
					columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
					spacing={1}
					sx={{ marginTop: "10px" }}>
					{items}
				</Masonry>
			)}
		</ProfileSectionContainer>
	);
}

export function UserItems({ title, status, accountName }) {
	const [loading, setLoading] = useState(true);
	const [items, setItems] = useState([]);

	useEffect(() => {
		getProfileID(accountName)
			.then((profileID) => {
				if (profileID === null) {
					throw new Error(`No profile with name '${accountName}'`);
				}
				getProfileData("items_watch_status", profileID).then(
					({ items_watch_status }) => {
						const items = [];
						for (const itemID in items_watch_status) {
							if (items_watch_status[itemID] === status) {
								items.push(
									<RecommendedItem
										key={itemID}
										itemID={itemID}
										index={items.length}
									/>
								);
							}
						}
						setItems(items);
						setLoading(false);
					}
				);
			})
			.catch((error) => {
				console.error(error);
				setItems([]);
			});
	}, [accountName, status]);

	return (
		<ProfileSectionContainer title={title}>
			{loading && <Loading />}
			{!loading && (
				<Grid container spacing={1} sx={{ padding: "5px" }}>
					{items}
				</Grid>
			)}
		</ProfileSectionContainer>
	);
}

export function UserRecommendedItems({ accountName }) {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getProfileID(accountName).then((profileID) => {
			getUserItemRecommendations(profileID)
				.then(({ data }) => {
					const recommendedItems = data.map(({ item_id }, index) => (
						<RecommendedItem key={item_id} itemID={item_id} index={index} />
					));
					setItems(recommendedItems);
				})
				.catch(() => {
					setItems([]);
				})
				.finally(() => {
					setLoading(false);
				});
		});
	}, [accountName]);

	return (
		<ProfileSectionContainer title="Recommended">
			{!loading && (
				<Grid container spacing={1} sx={{ padding: "5px" }}>
					{items}
				</Grid>
			)}
			{loading && <Loading />}
		</ProfileSectionContainer>
	);
}

export function UserReviews({ accountName }) {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getProfileID(accountName).then((profileID) => {
			getUserItemReviews(profileID)
				.then(({ data }) => {
					const reviewedItems = data.map(({ item_id }, index) => (
						<ReviewItem
							key={item_id}
							itemID={item_id}
							creatorID={profileID}
							index={index}
						/>
					));
					setItems(reviewedItems);
				})
				.catch(() => {
					setItems([]);
				})
				.finally(() => {
					setLoading(false);
				});
		});
	}, [accountName]);

	return (
		<ProfileSectionContainer title="Reviews">
			{!loading && (
				<Grid container spacing={1} sx={{ padding: "5px" }}>
					{items}
				</Grid>
			)}
			{loading && <Loading />}
		</ProfileSectionContainer>
	);
}

export function EditProfile({ open, closeDialog }) {
	const router = useRouter();
	const { profileID } = useContext(UserAuthContext);
	const [loading, setLoading] = useState(true);
	const [profileData, setProfileData] = useState({
		avatarURL: DEFAULT_AVATAR_URL,
		accountName: "",
		displayName: "",
		bio: "",
	});
	const [formInfo, setFormInfo] = useState("");
	const [formIsValid, setFormIsValid] = useState(true);
	const [btnDisabled, setBtnDisabled] = useState({
		save: false,
		cancel: false,
	});
	const currentAccountNameRef = useRef();
	const shouldAvatarChange = useRef(false);
	const avatarFile = useRef(null);

	useEffect(() => {
		const loadAccountData = async () => {
			if (!open) return;
			setLoading(true);
			const { avatar_url, account_name, display_name, bio } =
				await getProfileData("*", profileID);
			setProfileData({
				avatarURL: avatar_url,
				accountName: account_name,
				displayName: display_name,
				bio,
			});
			currentAccountNameRef.current = account_name;
			setLoading(false);
		};

		if (!profileID) {
			closeDialog();
		} else {
			loadAccountData();
		}
	}, [closeDialog, profileID, open]);

	useEffect(() => {
		if (!open) return;
		setFormIsValid(false);
		// CHECK IF THE ACCOUNT NAME INPUTTED BY USER IS NOT ALREADY TAKEN
		const identifier = setTimeout(() => {
			const { accountName } = profileData;
			if (
				accountName.length >= 3 &&
				accountName !== currentAccountNameRef.current
			) {
				supabase
					.from("profiles")
					.select("*")
					.eq("account_name", accountName)
					.then((db_result) => {
						if (db_result.data.length !== 0) {
							setFormInfo(`Account name '${accountName}' is already taken`);
						} else {
							setFormIsValid(true);
						}
					});
			} else if (accountName === currentAccountNameRef.current) {
				setFormIsValid(true);
			}
		}, 600);
		return () => clearTimeout(identifier);
	}, [profileData, open]);

	const accountNameChangeHandler = (event) => {
		setFormInfo("");
		const value = event.target.value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
		setProfileData((snapshot) => {
			return { ...snapshot, accountName: value };
		});
	};

	const displayNameChangeHandler = (event) => {
		const { value } = event.target;
		setProfileData((snapshot) => {
			return { ...snapshot, displayName: value };
		});
	};

	const bioChangeHandler = (event) => {
		const { value } = event.target;
		setProfileData((snapshot) => {
			return { ...snapshot, bio: value };
		});
	};

	const clearTempFile = () => {
		supabase.storage.from("avatars").remove(`temp/${profileID}`);
	};

	// UPDATE ACCOUNT DATA
	const formSubmitHandler = async (e) => {
		e.preventDefault();

		if (profileID !== null) {
			setBtnDisabled({ save: true, cancel: true });
			const newData = {
				account_name: accountName,
				bio,
				display_name: displayName,
			};
			if (shouldAvatarChange.current === true) {
				await supabase.storage
					.from("avatars")
					.upload(`final/${profileID}`, avatarFile.current, { upsert: true });
				const avatarFileURL = supabase.storage
					.from("avatars")
					.getPublicUrl(`final/${profileID}`).data.publicUrl;
				newData["avatar_url"] = avatarFileURL;
				clearTempFile();
			}
			await supabase.from("profiles").update(newData).eq("id", profileID);
			closeDialog();
			router.replace(`/users/${accountName}`);
			window.location.reload();
		} else {
			setFormInfo("Update process failed. No user signed in.");
		}
	};

	const updateUserPhoto = (e) => {
		if (e.target.files.length > 0) {
			setBtnDisabled({ save: true, cancel: false });
			const imageFile = e.target.files[0];
			supabase.storage
				.from("avatars")
				.upload(`temp/${profileID}`, imageFile, { upsert: true })
				.then((data) => {
					const tempImageURL = supabase.storage
						.from("avatars")
						.getPublicUrl(`temp/${profileID}`).data.publicUrl;
					shouldAvatarChange.current = true;
					avatarFile.current = imageFile;
					setProfileData((snapshot) => {
						return { ...snapshot, avatarURL: tempImageURL };
					});
					setBtnDisabled({ save: false, cancel: false });
				});
		}
	};

	const cancelUpdate = () => {
		closeDialog();
		if (shouldAvatarChange.current === true) {
			clearTempFile();
		}
	};

	const style = {
		maxWidth: "450px",
		width: "95%",
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
	};

	const uploadBtnStyle = {
		color: "white",
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
	};

	const { accountName, avatarURL, displayName, bio } = profileData;
	return (
		<Modal open={open}>
			<Box sx={style}>
				{!loading && (
					<form className={styles.editProfileForm} onSubmit={formSubmitHandler}>
						<div className="d-flex gap-3 align-items-center">
							<label className={styles.formLabel} htmlFor="acct_name">
								Update profile picture
							</label>
							<span className={styles.updateProfilePic}>
								<Image src={avatarURL} alt={accountName} width={100} height={100} quality={100} />
								<IconButton
									aria-label="upload picture"
									sx={uploadBtnStyle}
									component="label">
									<input
										hidden
										accept="image/*"
										type="file"
										onChange={updateUserPhoto}
									/>
									<PhotoCamera />
								</IconButton>
							</span>
						</div>
						<div className="d-flex gap-3 justify-content-between align-items-center">
							<label className={styles.formLabel} htmlFor="acct_name">
								Account name
							</label>
							<input
								id="acct_name"
								value={accountName}
								onChange={accountNameChangeHandler}
								spellCheck={false}
								minLength={3}
								required
							/>
						</div>
						<div className="d-flex gap-3 justify-content-between align-items-center">
							<label className={styles.formLabel} htmlFor="d_name">
								Display name
							</label>
							<input
								id="d_name"
								value={displayName}
								onChange={displayNameChangeHandler}
								spellCheck={false}
								minLength={3}
								required
							/>
						</div>
						<div className="d-flex gap-3 justify-content-between align-items-center">
							<label className={styles.formLabel} htmlFor="bio">
								Bio
							</label>
							<textarea
								id="bio"
								value={bio}
								onChange={bioChangeHandler}
								spellCheck={false}
							/>
						</div>
						<small className="text-info">{formInfo}</small>
						<span className="align-self-end d-flex gap-2">
							<button
								type="submit"
								className={styles.editFormBtn}
								disabled={!formIsValid || btnDisabled.save}>
								Save
							</button>
							<button
								type="button"
								onClick={cancelUpdate}
								className={styles.editFormBtn}
								disabled={btnDisabled.cancel}>
								Cancel
							</button>
						</span>
					</form>
				)}
				{loading && <Loading />}
			</Box>
		</Modal>
	);
}
