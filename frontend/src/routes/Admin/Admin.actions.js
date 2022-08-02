import { component, sc_package } from "../../pte-specifics/commands";

async function publishPackage({ localWasmPath }, onSuccess) {

  const transaction = await sc_package.publish({ localWasmPath });
  console.log('Component Published');

  onSuccess && onSuccess(transaction?.address);

  return transaction;

}

async function instantiateComponent(componentName, { chessPackageAddress, auctionPackageAddress, setGameComponentAddress, setGameBadgeAddress }) {

  const instance = await component.instantiate(componentName, { chessPackageAddress, auctionPackageAddress });
  console.log('Component Instantiated.');

  setGameComponentAddress(instance?.component || 'Error.');
  setGameBadgeAddress(instance?.resources?.game_badge || 'Error.');

  return instance;

}

export { publishPackage, instantiateComponent };