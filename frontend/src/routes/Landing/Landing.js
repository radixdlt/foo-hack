import React, { useEffect, useState } from 'react';
import '../../App.css';

import { Box, Button } from '@mui/material';

import CreateAccountModal from '../../components/CreateAccountModal';
import { USER } from '../../pte-specifics/address-mappings';
import Loader from '../../components/Loader';
import GameTabs from '../../components/GameTabs';
import { createGame, submitNickname } from './Landing.requests';
import { populateGames } from './Landing.mutators';

function Landing() {

  const [userBadge, setBadge] = useState(null);
  const [games, setGames] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {

    setTimeout(() => {

      //getBadge();

    }, 500);


  }, []);

  useEffect(() => {

    populateGames(setGames);

    if (!userBadge) {
      return;
    }

  }, [userBadge]);

  useEffect(() => {

    if (games !== null) {
      setIsLoading(false);
    }

  }, [games]);

  return (
    <>
      <h2 className="header">Welcome to RadiChess!</h2>
      <div className="constrained-container">

        <Loader visible={isLoading}>
          <Box textAlign="center" marginTop="30px">
            <Button variant="contained" onClick={handleOpen}>Create Profile</Button>
          </Box>
          {!userBadge
            ? <CreateAccountModal open={modalOpen} handleClose={handleClose} handleSubmit={(val) => submitNickname({ nickname: val, accountAddress: USER.account.address })} />
            : <GameTabs games={games} userBadge={userBadge} buttonAction={createGame} />
          }
        </Loader>

      </div>
    </>
  );
}

export default Landing;
