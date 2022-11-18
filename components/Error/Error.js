import ErrorIcon from "@mui/icons-material/Error";
import { Box, Typography } from "@mui/material";

const Error = ({ title, extraText, sx = {} }) => {
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100%",
				...sx,
			}}>
			<div className="d-flex flex-column align-items-center">
				<ErrorIcon sx={{ fontSize: 50, color: "indianred" }} />
				<Typography variant="h4" sx={{ fontFamily: "'Ubuntu', sans-serif"}}>{title || "Error"}</Typography>
				{extraText && <Typography color="antiquewhite">{extraText}</Typography>}
			</div>
		</Box>
	);
};

export default Error;
