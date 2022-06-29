import { game, account } from '../../pte-specifics/commands';

async function createGame({ walletResource }, onSuccess = null, onFail = null) {

  if (!walletResource) {
    onFail && onFail({ reason: 'No wallet resource was passed through.' });
  }

  const transaction = await game.create({ walletResource });

  if (transaction?.status === 'Success') {
    onSuccess && onSuccess({ transaction });
  } else {
    onFail && onFail({ reason: 'Log transaction response.', transaction });
  }

  return transaction;

}

async function createNickname({ accountAddress, nickname }, onSuccess = null, onFail = null) {

  const transaction = await account.createBadge({ accountAddress, nickname });

  if (transaction?.status === 'Success') {
    onSuccess && onSuccess({ transaction });
  } else {
    onFail && onFail({ reason: 'Log transaction response.', transaction });
  }

  return transaction;

}


export { createGame, createNickname };