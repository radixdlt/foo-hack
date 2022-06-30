import React from "react";
import { Button } from "@mui/material";

import { generateButtonProperties } from "../GameList/GameList.utils";
import { joinGame, viewGame } from "../GameList/GameList.actions";
import "./GameItem.styles.scss";

import { isSpectator } from "../../pte-specifics/helpers/game.helpers";

function GameItem({ game, type, walletResource, navigate }) {

    if (!game) {
        return null;
    }

    const buttonProperties = generateButtonProperties({
        actions: {
            join: () => joinGame({
                gameAddress: game?.game_address,
                walletResource
            }, () => viewGame({ gameAddress: game?.game_address, navigate })),
            view: () => viewGame({ gameAddress: game?.game_address, navigate })
        },
        filterType: type,
        isSpectator: isSpectator({ userBadge: walletResource?.player?.badge, gameInfo: game })
    });

    return (
        <ul className="game-item">
            <li><strong>Game:</strong> {game.game_address}</li>
            <li>
                <strong>Player 1:</strong> {game.player1?.nickname} <em>(elo: {game.player1?.elo})</em>
            </li>
            <li>
                <strong>Player 2:</strong> {game.player2 ? <>{game.player2?.nickname} <em>(elo: {game.player2?.elo})</em></> : <> Waiting for player to join.</>}
            </li>

            {buttonProperties &&
                <li>
                    <Button variant="outlined" sx={{ marginTop: 2 }} onClick={buttonProperties.action}>{buttonProperties.text}</Button>
                </li>
            }

        </ul>
    );

}

export default GameItem;