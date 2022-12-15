import { Fragment, useState } from "react";
import { IconButton, Menu } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { bindMenu, bindTrigger } from "material-ui-popup-state";

export default function MoreOptions(props) {
	const [menuAnchorEl, setMenuAnchorEl] = useState(null);

	const openMenu = (event) => {
		setMenuAnchorEl(event.currentTarget);
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
	const menuAnchorOrigin = {
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
				aria-label="More"
				title="More"
				id="more-options-btn"
				aria-controls={menuOpen ? "more-options-menu" : undefined}
				aria-expanded={menuOpen ? "true" : undefined}
				aria-haspopup="true"
				onClick={openMenu}
				sx={moreOptionsBtnStyles}
				{...bindTrigger(props.popupState)}>
				<MoreVertIcon />
			</IconButton>
			<Menu
				id="more-options-menu"
				MenuListProps={{
					"aria-labelledby": "more-options-btn",
				}}
				anchorEl={menuAnchorEl}
				open={menuOpen}
				onClose={closeMenu}
				PaperProps={menuPaperProps}
				anchorOrigin={menuAnchorOrigin}
				{...bindMenu(props.popupState)}>
				{props.children}
			</Menu>
		</Fragment>
	);
}
