import React from "react";
import { useNavigate } from "react-router-dom";
import GameItem from '../GameItem';
import { generateEmptyListFallback, listGames } from "./GameList.utils";

function GameList({ games, type, userBadge = null }) {

    const navigate = useNavigate();

    if (!games) {
        return null;
    }

    const filteredList = listGames({ games, userBadge, filterType: type });

    if (filteredList.length) {
        return filteredList.map((game) => <GameItem key={game.game_address} game={game} type={type} userBadge={userBadge} navigate={navigate} />);
    }

    return generateEmptyListFallback({ filterType: type });

}

export default GameList;