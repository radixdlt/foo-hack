import React from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Box, Toolbar, Button } from "@mui/material";

function Header({ backButton = null }) {

    const navigate = useNavigate();

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                {backButton &&
                    <Toolbar>
                        <Button color="inherit" onClick={() => navigate(backButton.route)}>
                            {backButton.title}
                        </Button>
                    </Toolbar>
                }
            </AppBar>
        </Box>
    );

}

export default Header;