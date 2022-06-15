import React from 'react';
import commands from '../pte-specifics/commands';
import mappings from '../pte-specifics/address-mappings';
import '../App.css';

let chessPackage = {};

async function publish() {

  chessPackage = await commands.sc_package.publish();
  
  console.log('Component Published - Address: ' + chessPackage.address);

}

async function instantiate() {

  const radichessBlueprint = await commands.component.instantiate(chessPackage.address);
  mappings.blueprint = radichessBlueprint;
  console.log('Component Instantiated ↴');
  console.log(radichessBlueprint);

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
