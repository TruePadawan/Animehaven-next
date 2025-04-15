import ErrorIcon from "@mui/icons-material/Error";
import {Box, SxProps, Typography} from "@mui/material";

interface ErrorProps {
    title: string;
    extraText: string;
    sx?: SxProps;
}

const Error = (props: ErrorProps) => {
    const {title, extraText, sx = {}} = props;
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
                <ErrorIcon sx={{fontSize: 50, color: "indianred"}}/>
                <Typography variant="h4" sx={{fontFamily: "'Ubuntu', sans-serif"}}>{title || "Error"}</Typography>
                {extraText && <Typography color="antiquewhite">{extraText}</Typography>}
            </div>
        </Box>
    );
};

export default Error;
