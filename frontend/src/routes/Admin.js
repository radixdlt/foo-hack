import React from 'react';
import commands from '../pte-specifics/commands';
import addressMappings from '../pte-specifics/address-mappings';
import '../App.css';

async function publish() {

  const publishPackage = await commands.sc_package.publish();
  addressMappings.package = publishPackage.address;

}

async function instantiate() {

  commands.component.instantiate(addressMappings.package)

}

function Admin() {

  return (
    <>
      <div className="App">
        <div className="button" onClick={() => publish()}>Publish Package</div>
        <div className="button" onClick={() => instantiate()}>Init Component</div>
      </div>
    </>
  );
}

export default Admin;
