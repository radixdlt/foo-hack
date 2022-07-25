import React from "react";

import "./Game.styles.scss";

function ResultImage({ userBadge, gameInfo, gameResults }) {

  if (!userBadge) {
    return null;
  }

  return (
    <div className={'result-image ' + generateGifClass({ gameResults, isSpectator: isSpectator({ userBadge: walletResource?.player?.badge, gameInfo }), walletResource })}>
      <div>{generateResultText({ gameResults, isSpectator: isSpectator({ userBadge: walletResource?.player?.badge, gameInfo }), walletResource })}</div>
    </div>
  );

}

export default ResultImage;
