import React, { useState } from "react";
import { Box, CircularProgress } from '@mui/material';

function Loader({ visible }) {

    if (!visible) {
        return false;
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <CircularProgress />
        </Box>
    );

}

export default Loader;