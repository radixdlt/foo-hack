import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import { component, sc_package } from "../../pte-specifics/commands";

import "./Admin.styles.scss";

let chessPackage = {};

async function publish(callback) {

  chessPackage = await sc_package.publish();
  console.log('Component Published');

  callback(chessPackage.address);

  return chessPackage;

}

async function instantiate({ packageAddress, setComponentAddress, setBadgeHandlerAddress }) {

  const instance = await component.instantiate(packageAddress);
  console.log('Component Instantiated.');

  setComponentAddress(instance?.component || 'Error.');
  setBadgeHandlerAddress(instance?.resources?.game_badge || 'Error.');

  return instance;

}

function AddressItem({ children = null, addresses = null, text = null, generationAction = null }) {

  if (generationAction && !addresses) {

    return <Button className="address-button" variant="contained" color="inherit" onClick={() => generationAction({ addresses })}>{text}</Button>;

  }

  if (!addresses) {
    return null;
  }

  return children;

}

function Admin() {

  const [packageAddress, setPackageAddress] = useState('');
  const [componentAddress, setComponentAddress] = useState('');
  const [badgeHandlerAddress, setBadgeHandlerAddress] = useState('');

  return (
    <Box sx={{ maxWidth: '300px', display: 'flex', flexDirection: 'column', margin: 'auto', flexWrap: 'wrap' }}>

      <AddressItem title='Package' addresses={packageAddress} text='Publish Package' generationAction={() => publish(setPackageAddress)}>

        <div className="address-text">
          <strong>Package Address:</strong>
          <p>{packageAddress}</p>
        </div>

      </AddressItem>

      <AddressItem title='Component' addresses={componentAddress} text='Instantiate Component' generationAction={() => instantiate({ packageAddress, setComponentAddress, setBadgeHandlerAddress })}>

        <div className="address-text">
          <strong>Component Address:</strong>
          <p>{componentAddress}</p>
        </div>

        <div className="address-text">
          <strong>Badge Handler Address:</strong>
          <p>{badgeHandlerAddress}</p>
        </div>

      </AddressItem>

    </Box>
  );
}

export default Admin;
