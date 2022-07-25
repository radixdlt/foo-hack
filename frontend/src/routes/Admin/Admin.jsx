import React, { useState } from "react";
import { Box } from "@mui/material";
import { publishPackage, instantiateChess, instantiateAuction } from "./Admin.actions";

import config from "../../pte-specifics/config";

import AddressItem from "./AddressItem";

import "./Admin.styles.scss";

function Admin() {

  /* Package Addresses (collections of blueprints) */
  const [chessPackageAddress, setChessPackageAddress] = useState('');
  const [auctionPackageAddress, setAuctionPackageAddress] = useState('');

  /* Component Addresses */
  const [gameComponentAddress, setGameComponentAddress] = useState('');
  const [auctionComponentAddress, setAuctionComponentAddress] = useState('');

  /* Badge Handlers */
  const [gameBadgeAddress, setGameBadgeAddress] = useState('');
  const [auctionAdminBadgeAddress, setAuctionAdminBadgeAddress] = useState('');

  return (
    <Box sx={{ maxWidth: '300px', display: 'flex', flexDirection: 'column', margin: 'auto', flexWrap: 'wrap' }}>

      <AddressItem title='Auction Package' addresses={auctionPackageAddress} text='Publish Auction Package' generationAction={() => publishPackage({ localWasmPath: config.auction_wasm_path }, setAuctionPackageAddress)}>

        <div className="address-text">
          <strong>Auction Package Address:</strong>
          <p>{auctionPackageAddress}</p>
        </div>

      </AddressItem>

      <AddressItem disabled={!auctionPackageAddress} title='Auction Component' addresses={auctionComponentAddress} text='Instantiate Auction Component' generationAction={() => instantiateAuction({ auctionPackageAddress, setAuctionComponentAddress, setAuctionAdminBadgeAddress })}>

        <div className="address-text">
          <strong>Auction Component Address:</strong>
          <p>{auctionComponentAddress}</p>
        </div>

        <div className="address-text">
          <strong>Auction Admin Badge Handler Address:</strong>
          <p>{auctionAdminBadgeAddress}</p>
        </div>

      </AddressItem>

      <AddressItem disabled={!auctionPackageAddress} title='Chess Package' addresses={chessPackageAddress} text='Publish Chess Package' generationAction={() => publishPackage({ localWasmPath: config.chess_wasm_path }, setChessPackageAddress)}>

        <div className="address-text">
          <strong>Chess Package Address:</strong>
          <p>{chessPackageAddress}</p>
        </div>

      </AddressItem>

      <AddressItem disabled={!gameComponentAddress} title='Game Component' addresses={gameComponentAddress} text='Instantiate Game Component' generationAction={() => instantiateChess({ chessPackageAddress, setGameComponentAddress, setGameBadgeAddress })}>

        <div className="address-text">
          <strong>Chess Component Address:</strong>
          <p>{gameComponentAddress}</p>
        </div>

        <div className="address-text">
          <strong>Player Badge Handler Address:</strong>
          <p>{gameBadgeAddress}</p>
        </div>

      </AddressItem>

    </Box>
  );
}

export default Admin;
