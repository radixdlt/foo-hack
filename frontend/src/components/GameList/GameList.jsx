import React from "react";
import { useNavigate } from "react-router-dom";

import { generateEmptyListFallback, listGames } from "./GameList.utils";

import GameItem from "../GameItem/GameItem";

function GameList({ games, type, walletResource = null }) {

    const navigate = useNavigate();

    if (!games) {
        return null;
    }

    const filteredList = listGames({ games, userBadge: walletResource?.player?.badge, filterType: type });

    if (filteredList.length) {
        return filteredList.map((game) => <GameItem key={game.game_address} game={game} type={type} navigate={navigate} walletResource={walletResource} />);
    }

    return generateEmptyListFallback({ filterType: type });

}

export default GameList;