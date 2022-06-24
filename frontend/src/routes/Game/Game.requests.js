import { game, account } from '../../pte-specifics/commands';

async function getGameInfo({ gameAddress }, callback = false) {

  const gameInfo = await game.getGameInfo(gameAddress);

  callback && callback(gameInfo);

  return gameInfo;

}

export { getGameInfo };