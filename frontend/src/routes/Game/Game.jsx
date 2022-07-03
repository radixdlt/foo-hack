import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAsyncEffect from "use-async-effect";

import { getGameInfo } from "./Game.requests";
import { onDrop } from "./Game.actions";

import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

import { getPlayerId } from "../../pte-specifics/helpers/badge.helpers";
import { getGameOutcome, chessboardSetup, generateGifClass, generateResultText, isSpectator } from "../../pte-specifics/helpers/game.helpers";
import { account } from "../../pte-specifics/commands";

import Header from "../../components/Header";
import Loader from "../../components/Loader";
import "./Game.styles.scss";

function Game() {

  const params = useParams();
  const [gameInfo, setGameInfo] = useState(null);
  const [walletResource, setWalletResource] = useState(null);
  const [, setGameState] = useState(new Chess());
  const [gameResults, setGameResults] = useState(null);
  const [infoPoll, setInfoPoll] = useState(null);

  useAsyncEffect(async isActive => {

    setTimeout(async () => {

      const fetchWalletResource = await account.fetch();
      if (!isActive()) return;
      setWalletResource(fetchWalletResource);

      if (!fetchWalletResource?.player?.badge || infoPoll !== null) return;

      setInfoPoll(setInterval(async () => {

        const fetchGameInfo = await getGameInfo({ gameAddress: params.gameAddress });
        if (!isActive()) return;
        setGameInfo(fetchGameInfo);

      }, 5000));

    }, 500);

    return () => {
      clearInterval(infoPoll);
    };

  }, []);

  useEffect(() => {

    if (!gameInfo) return;

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
    playerId: getPlayerId({ badge: walletResource?.player?.badge }),
    nicknames: {
      player1: gameInfo?.player1?.nickname ?? 'Awaiting Player',
      player2: gameInfo?.player2?.nickname ?? 'Awaiting Player'
    }

  });

  return (
    <>
      <Header backButton={{ title: 'Back', route: '/' }} />

      <Loader visible={!gameInfo || !walletResource?.player?.badge}>
        <div className="board-outer">

          <div className="player-title">{setup.boardTopTitle}</div>

          {gameResults &&

            <div className={'result-image ' + generateGifClass({ gameResults, isSpectator: isSpectator({ userBadge: walletResource?.player?.badge, gameInfo }), walletResource })}>
              <div>{generateResultText({ gameResults, isSpectator: isSpectator({ userBadge: walletResource?.player?.badge, gameInfo }), walletResource })}</div>
            </div>

          }

          <Chessboard position={gameInfo?.fen ?? ''} onPieceDrop={(sourceSquare, targetSquare) => onDrop({ gameAddress: params.gameAddress, sourceSquare, targetSquare, walletResource }, setGameState)} boardOrientation={setup.orientation} arePiecesDraggable={!isSpectator({ userBadge: walletResource?.player?.badge, gameInfo })} />
          <div className="player-title">{setup.boardBottomTitle}</div>

        </div>
      </Loader>
    </>
  );
}

export default Game;
