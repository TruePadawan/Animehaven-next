import React, { Fragment, useState } from "react";
import { IconButton, Menu, PopoverOrigin } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { bindMenu, bindTrigger } from "material-ui-popup-state";
import { PopupState } from "material-ui-popup-state/core";

interface MoreOptionsProps {
  popupState: PopupState;
  children: React.ReactNode;
}

export default function MoreOptions(props: MoreOptionsProps) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<Element | null>(null);

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget as Element);
  };
  const closeMenu = () => {
    setMenuAnchorEl(null);
  };

  const menuOpen = Boolean(menuAnchorEl);
  const menuPaperProps = {
    sx: {
      backgroundColor: "#1B1B1B",
      color: "white",
    },
  };
  const menuAnchorOrigin: PopoverOrigin = {
    vertical: "top",
    horizontal: "right",
  };
  const moreOptionsBtnStyles = {
    alignSelf: "flex-start",
    padding: "0",
    color: "whitesmoke",
  };
  return (
    <Fragment>
      <IconButton
        {...bindTrigger(props.popupState)}
        aria-label="More"
        title="More"
        id="more-options-btn"
        aria-controls={menuOpen ? "more-options-menu" : undefined}
        aria-expanded={menuOpen ? "true" : undefined}
        aria-haspopup="true"
        onClick={openMenu}
        sx={moreOptionsBtnStyles}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        {...bindMenu(props.popupState)}
        id="more-options-menu"
        MenuListProps={{
          "aria-labelledby": "more-options-btn",
        }}
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={closeMenu}
        PaperProps={menuPaperProps}
        anchorOrigin={menuAnchorOrigin}
      >
        {props.children}
      </Menu>
    </Fragment>
  );
}
