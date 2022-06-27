import { game, account } from '../../pte-specifics/commands';

async function getGameInfo({ gameAddress }, callback = false) {

  const gameInfo = await game.getGameInfo(gameAddress);

  callback && callback(gameInfo);

  return gameInfo;

}

async function createGame({ navigate }) {

  const gameInstance = await game.create();

  console.log(gameInstance);

  //navigate(`/game/${gameInstance.address}`);

}

async function submitNickname({ nickname, accountAddress }) {

  const createdBadge = await account.createBadge({ accountAddress, nickname });

  console.log(createdBadge);
  //getBadge();

}


export { getGameInfo, createGame, submitNickname };