import { Box, CircularProgress } from "@mui/material";

const Loading = ({ sx = {}, progressElSx = {}, progressElAttr = {} }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        ...sx
      }}
    >
      <CircularProgress {...progressElAttr} sx={{ color: "goldenrod", ...progressElSx }} />
    </Box>
  );
};

export default Loading;