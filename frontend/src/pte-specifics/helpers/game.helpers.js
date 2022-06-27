import { getPlayerId } from "./badge.helpers";

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

function safeGameMutate(modify, setGameState) {

  setGameState((state) => {
    const update = { ...state };
    modify(update);
    return update;
  });

}

function isSpectator({ userBadge, gameInfo }) {

  const userId = getPlayerId({ badge: userBadge });

  if (!userId) {
    return true;
  }

  if (userId !== gameInfo?.player1?.player_id && userId !== gameInfo?.player2?.player_id) {

    return true;

  }

  return false;

}

function getPlayerRole({ userBadge, gameInfo }) {

  if (isSpectator({ userBadge, gameInfo })) {

    return {
      role: 'spectator'
    };

  }

  return {
    role: 'player'
  };

}

function hasPlayerWon({ playerId, winnerId }) {

  return playerId === winnerId;

}

function getGameOutcome({ gameInfo }) {

  if (!gameInfo) {
    return null;
  }

  const hasPlayer1Won = hasPlayerWon({ playerId: gameInfo.player1, winnerId: gameInfo.outcome.Winner });
  const hasPlayer2Won = hasPlayerWon({ playerId: gameInfo.player2, winnerId: gameInfo.outcome.Winner });

  return {
    status: !hasPlayer1Won && !hasPlayer2Won ? 'draw' : (hasPlayer1Won || hasPlayer2Won) ? 'concluded' : 'ongoing',
    results: hasPlayer1Won ? { winner: gameInfo.player1, loser: gameInfo.player2 } : hasPlayer2Won ? { winner: gameInfo.player2, loser: gameInfo.player1 } : null
  };

}

function generateResultText({ gameResults }) {

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

function generateGifClass({ gameResults }) {

  return gameResults.current_player_status === 'spectator' ? 'win' : gameResults.current_player_status;

}

export { chessboardSetup, safeGameMutate, getGameOutcome, getPlayerRole, generateGifClass, generateResultText, isSpectator };