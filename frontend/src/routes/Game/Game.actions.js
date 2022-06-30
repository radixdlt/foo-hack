import { game } from "../../pte-specifics/commands";

function safeGameMutate(modify, setGameState) {

  setGameState((state) => {
    const update = { ...state };
    modify(update);
    return update;
  });

}

function onDrop({ sourceSquare, targetSquare, gameAddress, walletResource }, onSuccess = null, onFail = null) {

  if (!sourceSquare || !targetSquare || !gameAddress || !walletResource) {
    return false;
  }

  let move = null;

  safeGameMutate(async (gameInstance) => {
    
    // move = gameInstance.move({
    //   from: sourceSquare,
    //   to: targetSquare,
    //   promotion: "q", // always promote to a queen
    // });

    // if (move) {

    //   await game.movePiece(params.gameAddress, move.from, move.to);

    // }

    await game.movePiece({ gameAddress, from: sourceSquare, to: targetSquare, walletResource });

  }, onSuccess);

  if (move === null) {
    onFail && onFail();
    return false;     // illegal move
  }

}

export { onDrop };