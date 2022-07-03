import React, { useState } from "react";
import { Box, Tab, Tabs, Button } from "@mui/material";

import GameList from "./GameList/GameList";
import TabPanel from "./TabPanel";

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

function GameTabs({ games, walletResource, buttonAction }) {

    const [currentTab, setCurrentTab] = useState(0);

    return (
        <Box sx={{ width: '100%', margin: 'auto', marginTop: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={currentTab} onChange={(e, tabIndex) => setCurrentTab(tabIndex)} aria-label="RadiChess Menu">
                    <Tab label="Games in Progress" {...a11yProps(0)} />
                    <Tab label="Join Game" {...a11yProps(1)} />
                    <Tab label="My Games" {...a11yProps(2)} />
                    <Tab label="Results" {...a11yProps(3)} />
                </Tabs>
            </Box>
            <TabPanel value={currentTab} index={0}>
                <GameList games={games} type="InProgress" walletResource={walletResource} />
            </TabPanel>
            <TabPanel value={currentTab} index={1}>
                <GameList games={games} type="Awaiting" walletResource={walletResource} />
            </TabPanel>
            <TabPanel value={currentTab} index={2}>
                <GameList games={games} type="MyGames" walletResource={walletResource} />
                <Box sx={{ borderTop: 1, borderColor: 'divider', marginTop: 3 }}>
                    <Button variant="contained" sx={{ marginTop: 3 }} onClick={buttonAction}>Create New Game</Button>
                </Box>
            </TabPanel>
            <TabPanel value={currentTab} index={3}>
                <GameList games={games} type="Finished" walletResource={walletResource} />
            </TabPanel>
        </Box>
    );
}

export default GameTabs;