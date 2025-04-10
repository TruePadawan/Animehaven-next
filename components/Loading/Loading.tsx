import {Box, CircularProgress, CircularProgressProps, SxProps} from "@mui/material";

interface LoadingProps {
    sx?: SxProps;
    progressElSx?: SxProps;
    progressElAttr?: CircularProgressProps;
}

const Loading = ({sx = {}, progressElSx = {}, progressElAttr = {}}: LoadingProps) => {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: "100%",
                ...sx
            }}
        >
            <CircularProgress {...progressElAttr} sx={{color: "goldenrod", ...progressElSx}}/>
        </Box>
    );
};

export default Loading;