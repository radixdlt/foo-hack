import React from "react";
import { isSpectator } from "../pte-specifics/helpers/game.helpers";
import { generateButtonProperties } from "./GameList/GameList.utils";

function GameItem({ game, type, userBadge, navigate }) {

    if (!game) {
        return null;
    }

    const buttonProperties = generateButtonProperties({ gameAddress: game?.game_address, navigate, filterType: type, isSpectator: isSpectator({ userBadge, gameInfo: game }), userBadge });

    return (

        <ul className="game-list">
            <li><strong>Game:</strong> {game.game_address}</li>
            <li>
                <strong>Player 1:</strong> {game.player1?.nickname} <em>(elo: {game.player1?.elo})</em>
            </li>
            <li>
                <strong>Player 2:</strong> {game.player2 ? <>{game.player2?.nickname} <em>(elo: {game.player2?.elo})</em></> : <> Waiting for player to join.</>}
            </li>

            {buttonProperties &&
                <li>
                    <div className="view-btn" onClick={buttonProperties.action}>{buttonProperties.text}</div>
                </li>
            }

        </ul>
    );

}

export default GameItem;