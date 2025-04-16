import {
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  styled,
} from "@mui/material";
import React from "react";
import { ArrowDropDown as ArrowDropDownIcon } from "@mui/icons-material";
import { UserAuthContext } from "../../context/UserAuthContext";

export default function OAuthButton() {
  const [menuIsOpen, setMenuIsOpen] = React.useState(false);
  const menuAnchorRef = React.useRef<HTMLDivElement>(null);
  const { handleGoogleAuth } = React.useContext(UserAuthContext);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const authOptions = [
    {
      description: "Sign in with Google",
      handler: handleGoogleAuth,
    },
  ];

  const handleMenuToggle = () => {
    setMenuIsOpen((prevState) => !prevState);
  };

  const handleMenuClose = () => {
    setMenuIsOpen(false);
  };

  const handleMenuItemClick = (index: number) => {
    setSelectedIndex(index);
    handleMenuClose();
  };

  return (
    <React.Fragment>
      <ButtonGroup ref={menuAnchorRef}>
        <AuthButton
          variant="contained"
          onClick={() => authOptions[selectedIndex].handler()}
        >
          {authOptions[selectedIndex].description}
        </AuthButton>
        <AuthButton
          size="small"
          variant="contained"
          onClick={handleMenuToggle}
          aria-controls={menuIsOpen ? "auth-options-menu" : undefined}
          aria-expanded={menuIsOpen ? "true" : undefined}
          aria-haspopup="menu"
        >
          <ArrowDropDownIcon />
        </AuthButton>
      </ButtonGroup>
      <Popper
        open={menuIsOpen}
        anchorEl={menuAnchorRef.current}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleMenuClose}>
                <MenuList id="auth-options-menu" autoFocusItem>
                  {authOptions.map((option, index) => (
                    <MenuItem
                      key={option.description}
                      selected={index === selectedIndex}
                      onClick={() => handleMenuItemClick(index)}
                    >
                      {option.description}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </React.Fragment>
  );
}

const AuthButton = styled(Button)(() => ({
  backgroundColor: "darkslategray",
  fontFamily: "inherit",
  "&:hover": {
    backgroundColor: "rgb(68, 115, 115)",
  },
}));
