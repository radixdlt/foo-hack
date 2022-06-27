import React from "react";
import { useNavigate } from "react-router-dom";
import { isSpectator } from "../pte-specifics/helpers/game.helpers";
import { game } from '../pte-specifics/commands';

function GameList({ games, type, userBadge = null }) {

    const navigate = useNavigate();

    async function joinGame(gameAddress) {


        const joinResult = await game.joinGame(gameAddress);

        if (!joinResult) {
            return null;
        }

        navigate(`/game/${gameAddress}`);

    }

    if (!games) {
        return null;
    }

    const reducedList = games.filter((gameInfo) => {

        if (!isSpectator({ userBadge, gameInfo }) && type === 'MyGames') {
            return true;
        } else {
            return gameInfo.status === type;
        }

    });

    return (
        reducedList.length > 0 ?
            reducedList.map((game) =>
                <ul key={game.game_address} className="game-list">
                    <li><strong>Game:</strong> {game.game_address}</li>
                    <li>
                        <strong>Player 1:</strong> {game.player1?.nickname} <em>(elo: {game.player1?.elo})</em>
                    </li>
                    <li>
                        <strong>Player 2:</strong> {game.player2?.nickname} <em>(elo: {game.player2?.elo})</em>
                    </li>

                    {type === 'InProgress' &&
                        <li>
                            <div className="view-btn" onClick={() => navigate(`/game/${game.game_address}`)}>Spectate Game</div>
                        </li>
                    }

                    {type === 'Awaiting' &&
                        <li>
                            <div className="view-btn" onClick={() => joinGame(game.game_address)}>Join Game</div>
                        </li>
                    }

                </ul>
            )
            :
            <>
                <div>
                    {type === 'MyGames' ?

                        'You have no games currently in progress.'

                        : type === 'InProgress' ?

                            'No games are currently in progress.'

                            : type === 'Awaiting' ?

                                'No games are currently available to join.'

                                : type === 'Finished' ?

                                    'No results are available.'

                                    :

                                    ''

                    }
                </div>
            </>

    );

}

export default GameList;