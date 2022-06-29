import React, { useEffect, useState } from 'react';
import '../../App.css';

import { Box, Button } from '@mui/material';

import CreateAccountModal from '../../components/CreateAccountModal';
import Loader from '../../components/Loader';
import GameTabs from '../../components/GameTabs';
import { createGame, createNickname } from './Landing.actions';
import useAsyncEffect from 'use-async-effect';
import { account, game } from '../../pte-specifics/commands';
import { useNavigate } from 'react-router-dom';

function Landing() {

  const navigate = useNavigate();

  const [walletResource, setWalletResource] = useState(null);
  const [games, setGames] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useAsyncEffect(async isActive => {

    if (modalOpen) return;

    setTimeout(async () => {

      const fetchWalletResource = await account.fetch();
      if (!isActive()) return;
      setWalletResource(fetchWalletResource);

      const fetchGames = await game.viewGames();
      if (!isActive()) return;
      setGames(fetchGames);

    }, 500);

  }, [modalOpen]);

  useEffect(() => {

    if (games !== null) {
      setIsLoading(false);
    }

  }, [games]);

  return (
    <>
      <h2 className="header">Welcome to Party Rock Chess!</h2>
      <div className="constrained-container">

        <Loader visible={isLoading}>
          {!walletResource?.player?.badge
            ?
            <>
              <Box textAlign="center" marginTop="30px">
                <Button variant="contained" onClick={handleOpen}>Create Profile</Button>
              </Box>
              <CreateAccountModal open={modalOpen} handleClose={handleClose} handleSubmit={(val) => createNickname({ accountAddress: walletResource?.address, nickname: val }, handleClose)} />
            </>
            : <GameTabs games={games} userBadge={walletResource?.player?.badge} buttonAction={() => createGame({ walletResource }, ({ transaction }) => navigate(`/game/${transaction.transactionHash}`))} />
          }
        </Loader>

      </div>
    </>
  );
}

export default Landing;
