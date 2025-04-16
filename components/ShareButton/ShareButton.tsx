import { IconButton } from "@mui/material";
import IosShareIcon from "@mui/icons-material/IosShare";

interface ShareButtonProps {
  onShareSuccess?: VoidFunction;
  onShareFailed?: VoidFunction;
}

export default function ShareButton(props: ShareButtonProps) {
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
      },
    );
  }

  return (
    <IconButton
      aria-label="share"
      title="share"
      sx={{ color: "white", fontSize: "1rem" }}
      onClick={onShareBtnClicked}
    >
      <IosShareIcon />
      <span style={{ marginLeft: "5px" }}>Share</span>
    </IconButton>
  );
}
