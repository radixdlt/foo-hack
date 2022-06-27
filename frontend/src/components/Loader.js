import React, { useState } from "react";
import { Box, CircularProgress } from '@mui/material';

function Loader({ children, visible }) {

    if (!visible) {
        return children;
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <CircularProgress />
        </Box>
    );

}

export default Loader;