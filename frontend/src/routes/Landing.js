import React, { useState } from 'react';
import '../App.css';

import { Box, Tabs, Tab, Typography } from '@mui/material';
import { useNavigate } from "react-router-dom";

function TabPanel(props) {

  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function GameList({ games, type }) {

    const navigate = useNavigate();

    const reducedList = games.filter((game) => {

      return game.status === type;

    })

    return (
      reducedList.map((game) =>
        <ul key={game.gameAddress} className="game-list">
          <li><strong>Game:</strong> {game.gameAddress}</li>
          <li>
            <strong>Player 1:</strong> {game.player_1.nickname} <em>(elo: {game.player_1.elo})</em>
          </li>
          <li>
            <strong>Player 2:</strong> {game.player_2.nickname} <em>(elo: {game.player_2.elo})</em>
          </li>
          <li>
            <div className="view-btn" onClick={() => navigate(`/game/${game.gameAddress}`)}>View Game</div>
          </li>
        </ul>
      )
    );

}

const mockData = {

  games: [
    {
      status: 'finshed',
      gameAddress: '21vcXrzHEnhlSKhfmwQADZc6iK',
      player_1: {
        nickname: 'Red A',
        elo: 2000
      },
      player_2: {
        nickname: 'Beem A',
        elo: 1500
      },
      outcome: 'draw'
    },
    {
      status: 'in_progress',
      gameAddress: '21vcXrzHEnhlSKhfmwQADZc6iK',
      player_1: {
        nickname: 'Red B',
        elo: 1000
      },
      player_2: {
        nickname: 'Beem B',
        elo: 1200
      }
    }
  ]

};

function GameTabs() {

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', margin: 'auto', marginTop: '40px', maxWidth: '650px' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="RadiChess Menu">
          <Tab label="My Games" {...a11yProps(0)} />
          <Tab label="Join Game" {...a11yProps(1)} />
          <Tab label="Games in Progress" {...a11yProps(2)} />
          <Tab label="Results" {...a11yProps(3)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>

        <GameList games={mockData.games} type="my_games" />

      </TabPanel>
      <TabPanel value={value} index={1}>

        <GameList games={mockData.games} type="awaiting" />

      </TabPanel>
      <TabPanel value={value} index={2}>

        <GameList games={mockData.games} type="in_progress" />

      </TabPanel>
      <TabPanel value={value} index={3}>

        <GameList games={mockData.games} type="finshed" />

      </TabPanel>
    </Box>
  );
}

function Landing() {

  return (
    <>
      <h2 className="header">Welcome to RadiChess!</h2>

      <GameTabs />

    </>
  );
}

export default Landing;
