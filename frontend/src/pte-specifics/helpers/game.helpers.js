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

  const hasPlayer1Won = hasPlayerWon({ playerId: gameInfo?.player1?.player_id, winnerId: gameInfo?.outcome?.Winner });
  const hasPlayer2Won = hasPlayerWon({ playerId: gameInfo?.player2?.player_id, winnerId: gameInfo?.outcome?.Winner });

  return {
    status: !hasPlayer1Won && !hasPlayer2Won ? 'draw' : (hasPlayer1Won || hasPlayer2Won) ? 'concluded' : 'ongoing',
    results: hasPlayer1Won ? { winner: gameInfo.player1, loser: gameInfo.player2 } : hasPlayer2Won ? { winner: gameInfo.player2, loser: gameInfo.player1 } : null
  };

}

function generateResultText({ gameResults, isSpectator, walletResource }) {

  if (!gameResults) {
    return '';
  }

  if (isSpectator) {
    return gameResults?.results?.winner?.nickname + ' is the winner!';
  } else if (hasPlayerWon({ playerId: walletResource?.player?.id, winnerId: gameResults?.results?.winner?.player_id })) {    
    return 'You Win!';
  } else {
    return 'You Lose!';
  }

  return '';

}

function generateGifClass({ gameResults, isSpectator, walletResource }) {

  const variant = Math.random() < 0.5 ? ' alt' : '';

  return gameResults.status === 'concluded' && isSpectator ? 'win' : hasPlayerWon({ playerId: walletResource?.player?.id, winnerId: gameResults?.results?.winner?.player_id }) ? 'win'+variant : 'loss'+variant;

}

export { chessboardSetup, getGameOutcome, getPlayerRole, generateGifClass, generateResultText, isSpectator };