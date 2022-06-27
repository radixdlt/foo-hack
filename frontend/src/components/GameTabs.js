import React, { useState } from "react";
import { Box, Tab, Tabs, Button } from '@mui/material';
import GameList from "./GameList";
import TabPanel from "./TabPanel";

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

function GameTabs({ games, userBadge, buttonAction }) {

    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%', margin: 'auto', marginTop: '40px' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="RadiChess Menu">
                    <Tab label="Games in Progress" {...a11yProps(0)} />
                    <Tab label="Join Game" {...a11yProps(1)} />
                    <Tab label="My Games" {...a11yProps(2)} />
                    <Tab label="Results" {...a11yProps(3)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <GameList games={games} type="InProgress" userBadge={userBadge} />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <GameList games={games} type="Awaiting" userBadge={userBadge} />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <>
                    <GameList games={games} type="MyGames" userBadge={userBadge} />
                    <Button variant="contained" sx={{ marginTop: '20px' }} onClick={buttonAction}>Create New Game</Button>
                </>
            </TabPanel>
            <TabPanel value={value} index={3}>
                <GameList games={games} type="Finished" userBadge={userBadge} />
            </TabPanel>
        </Box>
    );
}

export default GameTabs;