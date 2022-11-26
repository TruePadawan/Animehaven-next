import { IconButton } from "@mui/material";
import IosShareIcon from "@mui/icons-material/IosShare";

export default function ShareButton(props) {
	function onShareBtnClicked() {
		navigator.clipboard.writeText(window.location.href).then(
			() => {
				if (props.onShareSuccess !== undefined) {
					props.onShareSuccess();
				}
			},
			() => {
				if (props.onShareFailed !== undefined) {
					props.onShareFailed();
				}
			}
		);
	}

	return (
		<IconButton
			aria-label="share"
			sx={{ color: "white", fontSize: "1rem" }}
			onClick={onShareBtnClicked}>
			<IosShareIcon />
			<span style={{ marginLeft: "5px" }}>Share</span>
		</IconButton>
	);
}
