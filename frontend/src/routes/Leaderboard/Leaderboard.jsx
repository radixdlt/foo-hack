import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Box, Toolbar, Button } from "@mui/material";

import { player } from "../../pte-specifics/commands";
import "../../App.css";


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

function PlayerList({ players }) {

  if (!players) {
    return null;
  }

  return (
    players.length > 0 ?
      players.map((player) =>
        <ul key={player.player_id} className="player-list">
          <li><strong>Username:</strong> {player.nickname}</li>
          <li><strong>Elo:</strong> {player.elo}</li>
        </ul>
      )
      :
      <>
        <div>No Players.</div>
      </>

  );

}

function Leaderboard() {

  const [players, setPlayers] = useState(null);

  async function getPlayers() {

    const players = await player.listPlayers();

    players = players.sort(function (a, b) {
      if (parseInt(a.elo) < parseInt(b.elo)) {
        return 1
      } else {
        return -1
      }

    });

    setPlayers(players);
  }

  useEffect(() => {

    setTimeout(() => {

      getPlayers();

    }, 200);
  }, []);

  return (
    <>
      <ButtonAppBar />
      <h1>Leaderboard!</h1>
      <PlayerList players={players} type="PlayerList" />
    </>
  );
}

export default Leaderboard;
