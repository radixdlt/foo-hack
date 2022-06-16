import React, { useEffect, useState } from 'react';
import '../App.css';

import { Box, Tabs, Tab, Typography, Button } from '@mui/material';
import { useNavigate } from "react-router-dom";
import account from '../pte-specifics/commands/account';
import game from '../pte-specifics/commands/game';
import CreateAccountModal from '../components/CreateAccountModal';
import mappings from '../pte-specifics/address-mappings';

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

function isGameInvolved(userBadge, gameInfo) {

  if (!userBadge) {
    return false;
  }

  if (userBadge?.nonFungibleIds[0] && (userBadge?.nonFungibleIds[0] === gameInfo?.player1?.player_id || userBadge?.nonFungibleIds[0] === gameInfo?.player2?.player_id)) {

    return true;

  }

  return false;

}

function GameList({ games, type, userBadge = null }) {

  const navigate = useNavigate();

  async function joinGame(gameAddress) {

    const joinResult = await game.joinGame(gameAddress);

    if (!joinResult) {
      return null;
    }

    navigate(`/game/${gameAddress}`);

  }

  if (!games) {
    return null;
  }

  const reducedList = games.filter((game) => {

    if (userBadge && isGameInvolved(userBadge, game) && type === 'MyGames') {
      return true;
    } else if (userBadge && !isGameInvolved(userBadge, game)) {
      return game.status === type;
    }

  });

  return (
    reducedList.length > 0 ?
      reducedList.map((game) =>
        <ul key={game.game_address} className="game-list">
          <li><strong>Game:</strong> {game.game_address}</li>
          <li>
            <strong>Player 1:</strong> {game.player1?.nickname} <em>(elo: {game.player1?.elo})</em>
          </li>
          <li>
            <strong>Player 2:</strong> {game.player2?.nickname} <em>(elo: {game.player2?.elo})</em>
          </li>

          {type === 'InProgress' &&
            <li>
              <div className="view-btn" onClick={() => navigate(`/game/${game.game_address}`)}>Spectate Game</div>
            </li>
          }

          {type === 'Awaiting' &&
            <li>
              <div className="view-btn" onClick={() => joinGame(game.game_address)}>Join Game</div>
            </li>
          }

        </ul>
      )
      :
      <>
        <div>
          {type === 'MyGames' ?

            'You have no games currently in progress.'

            : type === 'InProgress' ?

              'No games are currently in progress.'

              : type === 'Awaiting' ?

                'No games are currently available to join.'

                : type === 'Finished' ?

                  'No results are available.'

                  :

                  ''

          }
        </div>
      </>

  );

}

function GameTabs({ games, userBadge }) {

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
          <Button variant="contained" sx={{ marginTop: '20px' }} onClick={() => game.create()}>Create New Game</Button>
        </>

      </TabPanel>
      <TabPanel value={value} index={3}>

        <GameList games={games} type="Finished" userBadge={userBadge} />

      </TabPanel>
    </Box>
  );
}

function Landing() {

  const [userBadge, setBadge] = useState(null);
  const [games, setGames] = useState(null);
  const [uNickname, setUNickname] = useState(null);

  const [modalOpen, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {

    setTimeout(() => {

      getBadge();
      getGames();

    }, 500);


  }, []);

  useEffect(() => {

    if (!userBadge) {
      return;
    }

  }, [userBadge]);

  useEffect(() => {

    if (!uNickname) {
      return;
    }

    getGames();

  }, [uNickname]);

  async function getBadge() {

    const getUserAccount = await account.fetch();

    // Todo - if account is undefined, ask the use to create an account via the extension

    console.log('User Account ↴');
    console.log(getUserAccount);

    mappings.userAccount = getUserAccount;
    setBadge(getUserAccount.player_badge);

  }

  async function getGames() {

    const games = await game.viewGames();
    setGames(games);

  }

  async function handleNicknameSubmit(inputVal) {

    const userBadgeReceipt = await account.createBadge({
      accountAddress: mappings.userAccount.address,
      nickname: inputVal
    });

    // if (userBadgeReceipt) {

    //   setUNickname(true);

    // }

  }

  return (
    <>
      <h2 className="header">Welcome to RadiChess!</h2>
      <div className="constrained-container">

        {!userBadge &&
          <>
            <Box textAlign="center" marginTop="30px">
              <Button variant="contained" onClick={handleOpen}>Create Profile</Button>
            </Box>
            {!uNickname &&
              <CreateAccountModal open={modalOpen} handleClose={handleClose} handleSubmit={handleNicknameSubmit} />
            }
          </>
        }

        {userBadge &&
          <GameTabs games={games} userBadge={userBadge} />
        }

      </div>
    </>
  );
}

export default Landing;
