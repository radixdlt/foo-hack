import { component, sc_package } from "../../pte-specifics/commands";

async function publishPackage({ localWasmPath }, onSuccess) {

  const transaction = await sc_package.publish({ localWasmPath });
  console.log('Component Published');

  onSuccess && onSuccess(transaction?.address);

  return transaction;

}

async function instantiateChess({ chessPackageAddress, auctionPackageAddress, setGameComponentAddress, setGameBadgeAddress }) {

  const instance = await component.instantiate({ address: chessPackageAddress, auctionPackageAddress });
  console.log('Component Instantiated.');

  setGameComponentAddress(instance?.component || 'Error.');
  setGameBadgeAddress(instance?.resources?.game_badge || 'Error.');

  return instance;

}

async function instantiateAuction({ auctionPackageAddress, setAuctionComponentAddress, setAuctionAdminBadgeAddress }) {

  const instance = await component.instantiate(auctionPackageAddress);
  console.log('Component Instantiated.');

  setAuctionComponentAddress(instance?.component || 'Error.');
  setAuctionAdminBadgeAddress(instance?.resources?.admin_badge_address || 'Error.');

  return instance;

}

export { publishPackage, instantiateChess, instantiateAuction };