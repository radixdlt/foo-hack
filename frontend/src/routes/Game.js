import React, { useEffect, useState } from 'react';
import '../App.css';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
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
  const [game, setGame] = useState(new Chess());

  useEffect(() => {

    //getGameInfo(params.gameAddress);

  }, [params?.gameAddress]);

  function safeGameMutate(modify) {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

  async function getGameInfo(gameAddress) {

    const gameInfo = await game.getGameInfo(gameAddress);
    setGameInfo(gameInfo);

  }

  if (!params?.gameAddress || params.gameAddress.length < 26) {

    return <div>Invalid Address.</div>;

  }

  async function makeMove(e) {

    console.log(e);

  }

  function onDrop(sourceSquare, targetSquare) {

    let move = null;

    safeGameMutate((game) => {

      console.log(sourceSquare);
      console.log(targetSquare);

      move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // always promote to a queen
      });
    });

    if (move === null) {
      // illegal move
      return false;
    }

  }

  // if(!gameInfo) {

  //     return <div>Loading</div>;

  // }

  return (
    <>
      <ButtonAppBar />
      <div className="board-outer">
        <div className="player-title">Player 1 ({gameInfo?.player1.nickname ?? 'Not Set'})</div>
        <Chessboard position={game.fen()} onPieceDrop={onDrop} />
        <div className="player-title">Player 2 ({gameInfo?.player2.nickname ?? 'Not Set'})</div>
      </div>
    </>
  );
}

export default Game;
