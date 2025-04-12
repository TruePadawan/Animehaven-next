import {PhotoCamera} from "@mui/icons-material";
import {Masonry} from "@mui/lab";
import {Alert, Box, IconButton, Modal, Snackbar, SnackbarOrigin} from "@mui/material";
import Grid from "@mui/material/Grid";
import React, {Fragment, ReactElement, useCallback, useContext, useEffect, useRef, useState} from "react";
import DiscussionItem from "../../Items/DiscussionItem/DiscussionItem";
import ListItem from "../../Items/ListItem/ListItem";
import RecommendedItem from "../../Items/RecommendedItem/RecommendedItem";
import ProfileReviewItem from "../../Items/ProfileReviewItem/ProfileReviewItem";
import Loading from "../../Loading/Loading";
import {UserAuthContext} from "../../../context/UserAuthContext";
import styles from "./ProfileSections.module.css";
import {
    DEFAULT_AVATAR_URL,
    getDiscussionByAccountName,
    getErrorMessage,
    getProfileData,
    getProfileID,
    getUserItemRecommendations,
    getUserItemReviews,
    verifyProfileImage,
} from "../../../utilities/app-utilities";
import {useRouter} from "next/router";
import Image from "next/image";
import {useSupabaseClient} from "@supabase/auth-helpers-react";
import {
    EditProfileProps,
    ProfileSectionContainerProps,
    UserDiscussionsProps,
    UserItemsProps,
    UserListsProps,
    UserRecommendedItemsProps,
    UserReviewsProps,
    UserSavedListsProps
} from "./ProfileSections.types";
import {Database, Tables, TablesUpdate} from "../../../database.types";
import {PostgrestError} from "@supabase/supabase-js";
import {TriggerAlert} from "../../../utilities/global.types";
import {SnackbarProps} from "../../Comments-Reviews/Comments/types/CommentsList.types";

const ProfileSectionContainer = ({ title, children }: ProfileSectionContainerProps) => {
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

export function UserDiscussions({ accountName }: UserDiscussionsProps) {
	const [loading, setLoading] = useState(false);
	const [items, setItems] = useState<ReactElement[]>([]);
	const supabase = useSupabaseClient<Database>();

	useEffect(() => {
		setLoading(true);
		getDiscussionByAccountName(supabase, accountName)
			.then((data: Tables<"discussions">[]) => {
				const list = data.map((discussion) => (
					<DiscussionItem
						key={discussion.id}
						id={discussion.id}
						title={discussion.title}
						tag={discussion.tag}
						creator_id={discussion.creator_id}
					/>
				));
				setItems(list);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [accountName, supabase]);

	return (
		<ProfileSectionContainer title="Discussions">
			{loading && <Loading />}
			{!loading && <ul className={styles.discussions}>{items}</ul>}
		</ProfileSectionContainer>
	);
}

export function UserLists({ accountName }: UserListsProps) {
	const [lists, setLists] = useState<ReactElement[]>([]);
	const [loading, setLoading] = useState(false);
	const supabase = useSupabaseClient<Database>();

	useEffect(() => {
		setLoading(true);
		getProfileID(supabase, accountName).then((id) => {
			supabase
				.from("anime_lists")
				.select("id")
				.eq("creator_id", id)
				.then(
					({ data: listsData, error }) => {
						if (error) throw error;
						const lists = listsData.map((list) => {
							return <ListItem key={list.id} listId={list.id} />;
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
	}, [accountName, supabase]);

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

export function UserSavedLists({ accountName }: UserSavedListsProps) {
	const [loading, setLoading] = useState(false);
	const [items, setItems] = useState<ReactElement[]>([]);
	const supabase = useSupabaseClient<Database>();

	useEffect(() => {
		setLoading(true);
		supabase
			.rpc("get_saved_lists", { acct_name: accountName }).single()
			.then(({ data, error }) => {
				if (error) throw error;
				if (data === null) throw new Error("Could not retrieve saved lists");

				const transformed = data.map((list) => {
					return <ListItem key={list.id} listId={list.id} />;
				});
				setItems(transformed);
				setLoading(false);
			});
	}, [accountName, supabase]);

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

export function UserItems({ title, status, accountName }: UserItemsProps) {
	const [loading, setLoading] = useState(true);
	const [items, setItems] = useState<ReactElement[]>([]);
	const supabase = useSupabaseClient<Database>();

	useEffect(() => {
		setLoading(true);
		getProfileID(supabase, accountName)
			.then((profileID) => {
				if (profileID === null) {
					throw new Error(`No profile with name '${accountName}'`);
				}
				getProfileData(supabase, "items_watch_status", profileID).then(
					({ items_watch_status }) => {
						const items = [];
						for (const itemID in items_watch_status) {
							if (items_watch_status[itemID] === status) {
								items.push(
									<RecommendedItem
										key={itemID}
										itemId={itemID}
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
			.catch(() => {
				setItems([]);
			});
	}, [accountName, status, supabase]);

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

export function UserRecommendedItems({ accountName }: UserRecommendedItemsProps) {
	const [items, setItems] = useState<ReactElement[]>([]);
	const [loading, setLoading] = useState(false);
	const supabase = useSupabaseClient<Database>();

	useEffect(() => {
		setLoading(true);
		getProfileID(supabase, accountName).then((profileID) => {
			getUserItemRecommendations(supabase, profileID)
				.then(({ data, error }: { data: Tables<"item_recommendations">[], error?: PostgrestError}) => {
					if (error) throw error;
					const recommendedItems = data.map(({ item_id }, index) => (
						<RecommendedItem key={item_id} itemId={item_id} index={index} />
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
	}, [accountName, supabase]);

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

export function UserReviews({ accountName }: UserReviewsProps) {
	const [items, setItems] = useState<ReactElement[]>([]);
	const [loading, setLoading] = useState(false);
	const supabase = useSupabaseClient<Database>();

	useEffect(() => {
		setLoading(true);
		getProfileID(supabase, accountName).then((profileID) => {
			getUserItemReviews(supabase, profileID)
				.then(({ data, error }: { data: Tables<"item_reviews">[], error?: PostgrestError}) => {
                    if (error) throw error;
					const reviewedItems = data.map(({ item_id }, index) => (
						<ProfileReviewItem
							key={item_id}
							itemId={item_id}
							creatorId={profileID}
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
	}, [accountName, supabase]);

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

export function EditProfile({ open, closeDialog }: EditProfileProps) {
	const supabase = useSupabaseClient<Database>();
	const router = useRouter();
	const { profileID } = useContext(UserAuthContext);
	const [loading, setLoading] = useState(true);
	const [profileData, setProfileData] = useState({
		avatarURL: DEFAULT_AVATAR_URL,
		accountName: "",
		displayName: "",
		bio: "",
	});
	const [formIsValid, setFormIsValid] = useState(true);
	const [btnDisabled, setBtnDisabled] = useState({
		save: false,
		cancel: false,
	});
	const currentAccountNameRef = useRef();
	const shouldAvatarChange = useRef(false);
	const avatarFile = useRef<File | null>(null);
	const [snackbarData, setSnackbarData] = useState<SnackbarProps>({
		open: false,
		severity: "info",
		text: ""
	});

	const triggerAlert: TriggerAlert = useCallback((text, options) => {
		const alertSeverity = options?.severity;
		setSnackbarData({
			open: true,
			severity: alertSeverity || "info",
			text:
				alertSeverity === "error"
					? `${text} - ${
							getErrorMessage(options?.error)
					  }`
					: text,
		});
	}, []);

	function resetSnackbar(_event: React.SyntheticEvent<any> | Event, reason: string) {
		if (reason !== "clickaway") {
			setSnackbarData({
				open: false,
				severity: "info",
				text: ""
			});
		}
	}

	useEffect(() => {
		const loadAccountData = async () => {
			if (!open) return;
			setLoading(true);
			const { avatar_url, account_name, display_name, bio } =
				await getProfileData(supabase, "*", profileID);
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
	}, [closeDialog, profileID, open, supabase]);

	useEffect(() => {
		if (!open) return;
		setFormIsValid(false);
		// CHECK IF THE ACCOUNT NAME INPUTTED BY USER IS NOT ALREADY TAKEN
		const identifier = setTimeout(() => {
			const accountName = profileData.accountName;
			if (
				accountName.length >= 3 &&
				accountName !== currentAccountNameRef.current
			) {
				supabase
					.from("profiles")
					.select("*")
					.eq("account_name", accountName)
					.then(({ data, error}) => {
						if (error) throw error;
						if (data.length !== 0) {
							triggerAlert(`Account name '${accountName}' is already taken`, {
								severity: "warning",
							});
						} else {
							setFormIsValid(true);
						}
					});
			} else if (accountName === currentAccountNameRef.current) {
				setFormIsValid(true);
			}
		}, 600);
		return () => clearTimeout(identifier);
	}, [profileData.accountName, open, supabase]);

	const accountNameChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
		setProfileData((snapshot) => {
			return { ...snapshot, accountName: value };
		});
	};

	const displayNameChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target;
		setProfileData((snapshot) => {
			return { ...snapshot, displayName: value };
		});
	};

	const bioChangeHandler = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
		const { value } = event.target;
		setProfileData((snapshot) => {
			return { ...snapshot, bio: value };
		});
	};

	// UPDATE ACCOUNT DATA
    // TODO: rewrite the logic for this EditProfile component
	const formSubmitHandler = async (e: React.FormEvent) => {
		e.preventDefault();

		if (profileID !== null) {
			setBtnDisabled({ save: true, cancel: true });
			const newData: TablesUpdate<"profiles"> = {
				account_name: accountName,
				bio,
				display_name: displayName,
			};
			if (shouldAvatarChange.current && avatarFile.current !== null) {
				await supabase.storage
					.from("avatars")
					.upload(`final/${profileID}`, avatarFile.current, { upsert: true });
                newData["avatar_url"] = supabase.storage
                    .from("avatars")
                    .getPublicUrl(`final/${profileID}`).data.publicUrl;
			}
			await supabase.from("profiles").update(newData).eq("id", profileID);
			closeDialog();
			await router.replace(`/users/${accountName}`);
		} else {
			triggerAlert("Update process failed. No user signed in", {
				severity: "warning",
			});
		}
	};

	const updateUserPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files !== null && e.target.files.length > 0) {
			setBtnDisabled({ save: true, cancel: false });

			// MAKE SURE FILE IS IMAGE AND HAS VALID DIMENSIONS
			const selectedFile = e.target.files[0];
			verifyProfileImage(selectedFile, (isValid: boolean) => {
				if (isValid) {
					const img = document.createElement("img");
					img.addEventListener("load", () => {
						const { width, height, src } = img;
						if (width < 150 || height < 150) {
							triggerAlert(
								`Image must be at least 150x150 - Selected image dimensions are ${width}x${height}`,
								{
									severity: "warning",
								}
							);
						} else {
							setProfileData((snapshot) => {
								return { ...snapshot, avatarURL: src };
							});
							shouldAvatarChange.current = true;
							avatarFile.current = selectedFile;
							setBtnDisabled({ save: false, cancel: false });
						}
					});

					img.src = URL.createObjectURL(selectedFile);
				} else {
					triggerAlert("Invalid file! File must be an image of size <= 1MB", {
						severity: "warning",
					});
				}
			});
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

	const alertAnchorOrigin: SnackbarOrigin = {
		vertical: "top",
		horizontal: "center",
	};

	const { accountName, avatarURL, displayName, bio } = profileData;
	return (
		<Fragment>
			<Modal open={open}>
				<Box sx={style}>
					{!loading && (
						<form
							className={styles.editProfileForm}
							onSubmit={formSubmitHandler}>
							<div className="d-flex gap-3 align-items-center">
								<label className={styles.formLabel} htmlFor="profile_picture">
									<span>Update profile picture</span>
									<span
										className="d-block text-center"
										style={{ fontSize: "small" }}>
										{"<=1MB"}
									</span>
								</label>
								<span className={styles.updateProfilePic}>
									<Image
										src={avatarURL}
										alt={accountName}
										width={100}
										height={100}
										quality={100}
									/>
									<IconButton
										aria-label="upload picture"
										title="upload picture"
										sx={uploadBtnStyle}
										component="label">
										<input
											id="profile_picture"
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
							<span className="align-self-end d-flex gap-2">
								<button
									type="submit"
									className={styles.editFormBtn}
									disabled={!formIsValid || btnDisabled.save}>
									Save
								</button>
								<button
									type="button"
									onClick={closeDialog}
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
			<Snackbar
				open={snackbarData.open}
				autoHideDuration={6000}
				onClose={resetSnackbar}
				anchorOrigin={alertAnchorOrigin}>
				<Alert
					severity={snackbarData.severity}
					sx={{ width: "100%" }}>
					{snackbarData.text}
				</Alert>
			</Snackbar>
		</Fragment>
	);
}
