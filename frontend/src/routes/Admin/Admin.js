import React, { useState } from 'react';
import { Box, Button } from '@mui/material';

import { component, sc_package } from '../../pte-specifics/commands';

let chessPackage = {};

async function publish({ setter }) {

  chessPackage = await sc_package.publish();
  console.log('Component Published - Package Address: ' + chessPackage.address);

  setter(chessPackage);

  return;

}

async function instantiate({ setter }) {

  const instance = await component.instantiate(chessPackage.address);
  console.log('Component Instantiated ↴');
  console.log(instance);

  setter(instance);

  return;

}

function AddressItem({ title = '', addresses = null, setAddress, text, styles, action }) {

  if (!addresses) {

    return <Button variant="contained" color="inherit" sx={styles} onClick={() => action({ setter: setAddress })}>{text}</Button>;

  }

  return <div style={styles}><strong>{title} Addresses:</strong><p>{JSON.stringify(addresses)}</p></div>;

}

function Admin() {

  const [packageAddresses, setPackageAddresses] = useState('');
  const [componentAddresses, setComponentAddresses] = useState('');

  return (
    <Box sx={{ maxWidth: '50%', display: 'flex', flexDirection: 'column', margin: 'auto', flexWrap: 'wrap' }}>

      <AddressItem title='Package' addresses={packageAddresses} setAddress={setPackageAddresses} text='Publish Package' styles={{ marginTop: '40px', wordBreak: 'break-all' }} action={publish} />

      <AddressItem title='Component' addresses={componentAddresses} setAddress={setComponentAddresses} text='Instantiate Component' styles={{ marginTop: '20px', wordBreak: 'break-all' }} action={instantiate} />

    </Box>
  );
}

export default Admin;
