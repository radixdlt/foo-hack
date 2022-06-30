import { isSpectator } from "../../pte-specifics/helpers/game.helpers";

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

function generateButtonProperties({ filterType, isSpectator, actions }) {

    if (!filterType) {
        return null;
    }

    const text = {
        'InProgress': {
            text: isSpectator ? 'Spectate Game' : 'Continue Game',
            action: actions.view
        },
        'MyGames': {
            text: 'Continue Game',
            action: actions.view
        },
        'Awaiting': {
            text: 'Join Game',
            action: actions.join
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