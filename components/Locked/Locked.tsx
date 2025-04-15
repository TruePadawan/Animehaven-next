import {Box, SxProps, Typography} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";

interface LockedProps {
    sx?: SxProps;
}

const Locked = ({sx = {}}: LockedProps) => {
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
                <LockIcon sx={{fontSize: 50}}/>
                <Typography variant="h4">Private Content</Typography>
            </div>
        </Box>
    );
};

export default Locked;
