import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';


import { game, account } from '../../pte-specifics/commands';
import { USER } from '../../pte-specifics/address-mappings';

import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

import './Game.styles.scss';
import Header from '../../components/Header';
import { parsePlayerId } from '../../pte-specifics/helpers/badge.helpers';

let intervalRef = null;

// Idea - Use websockets to connect both clients and simply refer to the ledger for verification of data.

function chessboardSetup({ creatorId, playerId, nicknames }) {

  if (creatorId === playerId) {

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
  const [, setGameInstance] = useState(new Chess());
  const [gameResults, setGameResults] = useState(null);

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
      getGameInfo({ gameAddress: params.gameAddress });
    }, 5000);

    intervalRef = infoPoll;

    return () => {
      clearInterval(intervalRef);
    };

  }, [userBadge]);

  useEffect(() => {

    if (gameInfo && gameInfo.status === 'Finished') {
      outcomeHandler();
      if (intervalRef) {
        clearInterval(intervalRef);
      }
    }

  }, [gameInfo]);

  function safeGameMutate(modify) {
    setGameInstance((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

  function outcomeHandler() {

    if (!gameInfo || !userBadge) {
      return;
    }

    const results = {
      outcome: {
        winner: null,
        loser: null
      },
      current_player_status: null
    };

    if (gameInfo.player1.player_id === gameInfo.outcome.Winner ? gameInfo.player1 : gameInfo.player2) {
      results.outcome.winner = gameInfo.player1;
      results.outcome.loser = gameInfo.player2;
    } else {
      results.outcome.winner = gameInfo.player2;
      results.outcome.loser = gameInfo.player2;
    }

    if (isSpectator()) {

      results.current_player_status = 'spectator';

    } else {

      results.current_player_status = userBadge?.nonFungibleIds[0] === results.outcome.winner.player_id ? 'win' : 'loss';

    }

    setGameResults(results);

  }

  async function getGameInfo({ gameAddress }) {

    const gameInfo = await game.getGameInfo(gameAddress);
    setGameInfo(gameInfo);

  }

  async function getBadge() {

    const getUserAccount = await account.fetch();

    // Todo - if account is undefined, ask the use to create an account via the extension

    console.log('User Account ↴');
    console.log(getUserAccount);

    USER.account = getUserAccount;

    setBadge(getUserAccount.player_badge);

  }

  if (!params?.gameAddress || params.gameAddress.length < 26) {

    return <div>Invalid Address.</div>;

  }

  function onDrop(sourceSquare, targetSquare) {

    let move = null;

    safeGameMutate(async (gameInst) => {

      // Todo - Re-enable frontend move validation.
      // Todo - Ensure that piece movement is consistent (don't update state until component response).
      // Todo - Add the alternate final results.
      // Todo - Add the rewards / NFT auction mech.
      // Todo - Customise board and pieces.
      // Todo - Detect if wallet / account is not present.

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

  function isSpectator() {

    const userId = parsePlayerId(userBadge);

    if (!userId || userId !== gameInfo.player1.player_id && userId !== gameInfo.player2.player_id) {

      return true;

    }

    return false;

  }

  function gifClass() {

    return gameResults.current_player_status === 'spectator' ? 'win' : gameResults.current_player_status;

  }

  function resultText() {

    if (!gameResults) {
      return '';
    }

    if (gameResults.current_player_status === 'spectator') {
      return gameResults.outcome.winner.nickname + ' is the winner!';
    } else if (gameResults.current_player_status === 'win') {
      return 'You Win!';
    } else if (gameResults.current_player_status === 'loss') {
      return 'You Lose!';
    }

    return '';

  }

  const setup = chessboardSetup({
    creatorId: gameInfo?.player1?.player_id,
    playerId: parsePlayerId(USER.account?.player_badge),
    nicknames: {
      player1: gameInfo?.player1?.nickname ?? 'Not Set',
      player2: gameInfo?.player2?.nickname ?? 'Not Set'
    }
  });

  return (
    <>
      <Header backButton={{ title: 'Back', route: '/' }} />
      <div className="board-outer">
        {!gameInfo || !userBadge ?
          <div className="player-title">Loading</div>
          :
          <>
            <div className="player-title">{setup.boardTopTitle}</div>

            {gameResults &&

              <div className={'result-image ' + gifClass()}>
                <div>{resultText()}</div>
              </div>

            }

            <Chessboard position={gameInfo.fen ?? ''} onPieceDrop={onDrop} boardOrientation={setup.orientation} arePiecesDraggable={!isSpectator()} />
            <div className="player-title">{setup.boardBottomTitle}</div>
          </>
        }
      </div>
    </>
  );
}

export default Game;
