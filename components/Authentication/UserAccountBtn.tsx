import React, {Fragment, useEffect, useState} from "react";
import {
    Menu,
    MenuItem,
    IconButton,
    Avatar,
    CircularProgress,
} from "@mui/material";
import Link from "next/link";
import {getProfileData} from "../../utilities/app-utilities";
import Image from "next/image";
import {useSupabaseClient} from "@supabase/auth-helpers-react";
import {AccountMenuButtonProps} from "./types/UserAccountButton.types";
import {Database} from "../../database.types";
import {PostgrestError} from "@supabase/supabase-js";
import {DEFAULT_AVATAR_URL} from "../../utilities/global-constants";

const UserAccountBtn = (props: AccountMenuButtonProps) => {
    const supabase = useSupabaseClient<Database>();
    const [accountName, setAccountName] = useState("");
    const [menuAnchorEl, setMenuAnchorEl] = useState<Element | null>(null);
    const [photoSrc, setPhotoSrc] = useState(DEFAULT_AVATAR_URL);
    const [loading, setLoading] = useState(true);
    const isMenuOpen = Boolean(menuAnchorEl);
    const {profileID, errorHandler} = props;

    useEffect(() => {
        getProfileData(supabase, profileID).then(({account_name, avatar_url}) => {
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
                window.location.reload();
            })
            .catch((error) => {
                errorHandler("Failed to sign out!", error as PostgrestError);
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
                        <Avatar alt={accountName} sx={{color: "black"}}>
                            <Image
                                style={{objectFit: "contain"}}
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
            {loading && <CircularProgress sx={{color: "goldenrod"}}/>}
        </Fragment>
    );
};

export default UserAccountBtn;
