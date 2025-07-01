import React, { Fragment, useContext, useEffect, useState } from "react";
import {
  Avatar,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import Link from "next/link";
import { getProfileData } from "../../utilities/app-utilities";
import Image from "next/image";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { ProfileMenuButtonProps } from "./types/ProfileMenuButton.types";
import { Database } from "../../database.types";
import { PostgrestError } from "@supabase/supabase-js";
import { DEFAULT_AVATAR_URL } from "../../utilities/global-constants";
import { NotificationContext } from "../../context/notifications/NotificationContext";
import { useRouter } from "next/router";

const ProfileMenuButton = (props: ProfileMenuButtonProps) => {
  const supabase = useSupabaseClient<Database>();
  const [accountName, setAccountName] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<Element | null>(null);
  const [photoSrc, setPhotoSrc] = useState(DEFAULT_AVATAR_URL);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useContext(NotificationContext);
  const router = useRouter();
  const isMenuOpen = Boolean(menuAnchorEl);
  const { profileID } = props;

  useEffect(() => {
    getProfileData(supabase, profileID).then(({ account_name, avatar_url }) => {
      setAccountName(account_name);
      setPhotoSrc(avatar_url);
      setLoading(false);
    });
  }, [profileID, supabase]);

  const openMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(e.currentTarget as Element);
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
        router.reload();
      })
      .catch((error) => {
        showNotification("Failed to sign out!", {
          severity: "error",
          error: error as PostgrestError,
        });
      });
  };

  return (
    <Fragment>
      {!loading && (
        <Fragment>
          <IconButton
            onClick={openMenu}
            aria-label="profile menu button"
            aria-controls={isMenuOpen ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={isMenuOpen ? "true" : undefined}
          >
            <Avatar alt={accountName} sx={{ color: "black" }}>
              <Image
                style={{ objectFit: "contain" }}
                src={photoSrc}
                alt={accountName}
                width={40}
                height={40}
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
            slotProps={{
              paper: {
                sx: {
                  backgroundColor: "#121212",
                  color: "white",
                },
              },
            }}
          >
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

export default ProfileMenuButton;
