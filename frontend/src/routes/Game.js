import React, { useEffect, useState } from 'react';
import '../App.css';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useParams, useNavigate } from 'react-router-dom';
import { AppBar, Box, Toolbar, Button } from '@mui/material';
import game from '../pte-specifics/commands/game';
import account from '../pte-specifics/commands/account';
import mappings from '../pte-specifics/address-mappings';

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

function chessboardSetup(playerID, nonFungIds, nicknames) {

  if (playerID === nonFungIds) {

    return {
      orientation: 'black',
      boardTopTitle: nicknames.player2,
      boardBottomTitle: nicknames.player1
    };

  } else {

    return {
      orientation: 'white',
      boardTopTitle: nicknames.player1,
      boardBottomTitle: nicknames.player2
    };

  }

}

function Game() {

  const params = useParams();
  const [gameInfo, setGameInfo] = useState(null);
  const [userBadge, setBadge] = useState(null);
  const [gameInstance, setGameInstance] = useState(new Chess());

  useEffect(() => {

    setTimeout(() => {

      getBadge();

    }, 500);

  }, [params?.gameAddress]);

  useEffect(() => {

    if (!userBadge) {
      return;
    }
    
    const infoPoll = setInterval(() => {
      getGameInfo(params.gameAddress);
    }, 5000);

    return () => {
      clearInterval(infoPoll);
    };

  }, [userBadge]);

  useEffect(() => {

    console.log(gameInfo);

  }, [gameInfo]);

  function safeGameMutate(modify) {
    setGameInstance((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

  async function getGameInfo(gameAddress) {

    const gameInfo = await game.getGameInfo(gameAddress);
    setGameInfo(gameInfo);

  }

  async function getBadge() {

    const getUserAccount = await account.fetch();

    // Todo - if account is undefined, ask the use to create an account via the extension

    console.log('User Account ↴');
    console.log(getUserAccount);

    mappings.userAccount = getUserAccount;

    setBadge(getUserAccount.player_badge);

  }

  if (!params?.gameAddress || params.gameAddress.length < 26) {

    return <div>Invalid Address.</div>;

  }

  function onDrop(sourceSquare, targetSquare) {

    let move = null;

    safeGameMutate(async (gameInst) => {

      // move = gameInst.move({
      //   from: sourceSquare,
      //   to: targetSquare,
      //   promotion: "q", // always promote to a queen
      // });

      // if (move) {

      //   await game.movePiece(params.gameAddress, move.from, move.to);

      // }

      await game.movePiece(params.gameAddress, sourceSquare, targetSquare);

    });

    if (move === null) {
      // illegal move
      return false;
    }

  }

  const setup = chessboardSetup(gameInfo?.player1?.player_id, mappings?.userAccount?.player_badge?.nonFungibleIds?.[0],
    { player1: gameInfo?.player1?.nickname ?? 'Not Set', player2: gameInfo?.player2?.nickname }
  );

  return (
    <>
      <ButtonAppBar />
      <div className="board-outer">
        {!gameInfo || !userBadge ?
          <div className="player-title">Loading</div>
          :
          <>
            <div className="player-title">{setup.boardTopTitle}</div>
            <Chessboard position={gameInfo.fen ?? ''} onPieceDrop={onDrop} boardOrientation={setup.orientation} />
            <div className="player-title">{setup.boardBottomTitle}</div>
          </>
        }
      </div>
    </>
  );
}

export default Game;
