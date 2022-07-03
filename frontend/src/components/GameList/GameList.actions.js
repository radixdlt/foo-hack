import { game } from "../../pte-specifics/commands";

async function joinGame({ gameAddress, walletResource }, onSuccess = null, onFail = null) {

    if (!gameAddress || !walletResource) {
        return null;
    }

    const transaction = await game.joinGame({ gameAddress, walletResource });

    if (transaction?.status === 'Success') {
        onSuccess && onSuccess({ transaction });
    } else {
        onFail && onFail({ reason: 'Log transaction response.', transaction });
    }

    return transaction;

}

async function viewGame({ gameAddress, navigate }) {

    if (!gameAddress || !navigate) {
        return null;
    }

    navigate(`/game/${gameAddress}`);

}

export { joinGame, viewGame };
