import React from 'react';
import '../App.css';
import { Chessboard } from "react-chessboard";
import { useParams, useNavigate } from 'react-router-dom';
import { AppBar, Box, Toolbar, Button } from '@mui/material';

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

  if (!params?.gameAddress || params.gameAddress.length < 26) {

    return <div>Invalid Address.</div>;

  }

  return (
    <>
      <ButtonAppBar />
      <div className="board-outer">
        <div className="player-title">Player 1 (Nickname Here)</div>
        <Chessboard />
        <div className="player-title">Player 2 (Nickname Here)</div>
      </div>
    </>
  );
}

export default Game;
