import { game } from "../../pte-specifics/commands";

async function joinGame({ gameAddress, userBadge }, onSuccess = null, onFail = null) {

    if (!gameAddress || !userBadge) {
        return null;
    }

    const transaction = await game.joinGame({ gameAddress, userBadge });

    if (transaction?.status === 'Success') {
        onSuccess && onSuccess({ transaction });
    } else {
        onFail && onFail({ reason: 'Log transaction response.', transaction });
    }

    return transaction;

}

export { joinGame };
