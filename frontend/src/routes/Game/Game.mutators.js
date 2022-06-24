function safeGameMutate(modify, setGameState) {

  setGameState((state) => {
    const update = { ...state };
    modify(update);
    return update;
  });

}

function onDrop({ sourceSquare, targetSquare, gameAddress }, setGameState) {

  let move = null;

  safeGameMutate(async (gameInstance) => {

    // Todo - Re-enable frontend move validation.
    // Todo - Ensure that piece movement is consistent (don't update state until component response).
    // Todo - Add the alternate final results.
    // Todo - Add the rewards / NFT auction mech.
    // Todo - Customise board and pieces.
    // Todo - Detect if wallet / account is not present.

    // move = gameInstance.move({
    //   from: sourceSquare,
    //   to: targetSquare,
    //   promotion: "q", // always promote to a queen
    // });

    // if (move) {

    //   await game.movePiece(params.gameAddress, move.from, move.to);

    // }

    await game.movePiece(gameAddress, sourceSquare, targetSquare);

  }, setGameState);

  if (move === null) {
    return false;     // illegal move
  }

}

export { onDrop };