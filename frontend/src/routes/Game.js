import React, { useEffect, useState } from 'react';
import '../App.css';
import { Chessboard } from "react-chessboard";
import { useParams, useNavigate } from 'react-router-dom';
import { AppBar, Box, Toolbar, Button } from '@mui/material';
import game from '../pte-specifics/commands/game';

function ButtonAppBar() {

  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={() => navigate('/')}>Back</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

function Game() {

  const params = useParams();
  const [gameInfo, setGameInfo] = useState(null);

  useEffect(() => {

    getGameInfo(params.gameAddress);

  }, [params?.gameAddress]);

  async function getGameInfo(gameAddress) {

    const gameInfo = await game.getGameInfo(gameAddress);
    setGameInfo(gameInfo);

  }

  if (!params?.gameAddress || params.gameAddress.length < 26) {

    return <div>Invalid Address.</div>;

  }

  if(!gameInfo) {

      return <div>Loading</div>;

  }

  return (
    <>
      <ButtonAppBar />
      <div className="board-outer">
        <div className="player-title">Player 1 ({gameInfo.player1.nickname})</div>
        <Chessboard position={gameInfo.fen} />
        <div className="player-title">Player 2 ({gameInfo.player2.nickname})</div>
      </div>
    </>
  );
}

export default Game;
