import { game } from '../../pte-specifics/commands';

async function populateGames(setGameState) {

  const games = await game.viewGames();
  setGameState(games);

}

export { populateGames };