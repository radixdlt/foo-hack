import { isSpectator } from "../../pte-specifics/helpers/game.helpers";
import { joinGame } from "./GameList.actions";

function listGames({ games, userBadge, filterType }) {

    if (!games || !userBadge) {
        return null;
    }

    return games.filter((gameInfo) => {

        if (!isSpectator({ userBadge, gameInfo }) && filterType === 'MyGames') {
            return true;
        } else if (!isSpectator({ userBadge, gameInfo }) && filterType === 'Awaiting') {
            return false;
        } else {
            return gameInfo.status === filterType;
        }

    });

}

function generateButtonProperties({ gameAddress, navigate, filterType, isSpectator, userBadge }) {

    if (!filterType || !isSpectator) {
        return null;
    }

    const text = {
        'InProgress': {
            text: isSpectator ? 'Spectate Game' : 'Continue Game',
            action: () => navigate(`/game/${gameAddress}`)
        },
        'MyGames': {
            text: 'Continue Game',
            action: () => navigate(`/game/${gameAddress}`)
        },
        'Awaiting': {
            text: 'Join Game',
            action: () => joinGame({ gameAddress, userBadge })
        }
    };

    return text?.[filterType] || null;

}

function generateEmptyListFallback({ filterType }) {

    if (!filterType) {
        return null;
    }

    const text = {
        'MyGames': 'You have no games currently in progress.',
        'InProgress': 'No games are currently in progress.',
        'Awaiting': 'No games are currently available to join.',
        'Finished': 'No results are available.'
    };



    return text?.[filterType] ? <div>{text?.[filterType]}</div> : null;

}

export { listGames, generateButtonProperties, generateEmptyListFallback };