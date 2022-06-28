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

async function createNickname({ accountAddress, nickname }, onSuccess = false, onFail = false) {

  const transaction = await account.createBadge({ accountAddress, nickname });

  if (transaction?.status === 'Success') {
    onSuccess && onSuccess(transaction);
  } else {
    onFail && onFail(transaction);
  }

  return transaction;

}


export { createGame, createNickname };