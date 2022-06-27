import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { USER } from '../../pte-specifics/address-mappings';

import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

import './Game.styles.scss';
import Header from '../../components/Header';
import { getPlayerId } from '../../pte-specifics/helpers/badge.helpers';
import { getGameOutcome, chessboardSetup, generateGifClass, generateResultText, isSpectator } from '../../pte-specifics/helpers/game.helpers';
import { getGameInfo } from './Game.requests';
import { player } from '../../pte-specifics/commands';
import { onDrop } from './Game.mutators';

function Game() {

  const params = useParams();
  const [gameInfo, setGameInfo] = useState(null);
  const [userBadge, setBadge] = useState(null);
  const [, setGameState] = useState(new Chess());
  const [gameResults, setGameResults] = useState(null);
  const [infoPoll, setInfoPoll] = useState(null);

  useEffect(() => {

    setTimeout(() => {

      const playerBadge = player.getBadge();

      console.log(playerBadge);

    }, 500);

  }, [params?.gameAddress]);

  useEffect(() => {

    if (!userBadge) {
      return;
    }

    setInfoPoll(setInterval(() => {
      getGameInfo({ gameAddress: params.gameAddress }, setGameInfo);
    }, 5000));

    return () => {
      clearInterval(infoPoll);
    };

  }, [userBadge]);

  useEffect(() => {

    if (!gameInfo) {
      return;
    }

    if (gameInfo?.status === 'Finished') {

      setGameResults(getGameOutcome({ gameInfo }));

      if (infoPoll) {
        clearInterval(infoPoll);
      }

    }

  }, [gameInfo]);

  if (!params?.gameAddress || params.gameAddress.length < 26) {
    return <div>Invalid Address.</div>;
  }

  const setup = chessboardSetup({
    creatorId: gameInfo?.player1?.player_id,
    playerId: getPlayerId(USER.account?.player_badge),
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

              <div className={'result-image ' + generateGifClass({ gameResults })}>
                <div>{generateResultText({ gameResults })}</div>
              </div>

            }

            <Chessboard position={gameInfo.fen ?? ''} onPieceDrop={(sourceSquare, targetSquare) => onDrop({ gameAddress: params.gameAddress, sourceSquare, targetSquare }, setGameState)} boardOrientation={setup.orientation} arePiecesDraggable={!isSpectator()} />
            <div className="player-title">{setup.boardBottomTitle}</div>
          </>
        }
      </div>
    </>
  );
}

export default Game;
