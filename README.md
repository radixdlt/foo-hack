# FooHack
From June 14th to 16th 2022, three members of the Radix community [teamed up with redfoo](https://www.radixdlt.com/post/legendary-musician-redfoo-teams-up-with-radix-to-host-foohack), the legendary musician behind [Party Rock Anthem](https://www.youtube.com/watch?v=KQ6zr6kCPj8), to build a chess system using Scrypto as a backend. This repository is the result of this three day hackathon.

On the last day of the hackathon, **redfoo** tested the system by playing a live game against **Avaunt**, a member of the Radix community. You can see a recap of the match [here](https://www.youtube.com/watch?v=O3EMxDgIygo) (we will not spoil the winner).

Scrypto is the asset-oriented smart contract language of the Radix network and allows developers to build smart contract in a more intuitive and secure way. You can find more information about Scrypto [here](https://developers.radixdlt.com).

## The project
The code in this repository is split between the frontend functionality and the Scrypto code. Both were connected together using the [Public Testing Environment](https://docs.radixdlt.com/main/scrypto/public-test-environment/pte-introduction.html), that Radix is temporarily providing to be able to connect a frontend to a Scrypto backend before a real test network is out.

## Frontend
Using React, **@jameswylie** built a frontend that you can use to register as a player, list/view/create a chess game and view the leaderboard of players.

![Radichess game list](/images/game_list.png)
![Radichess spectate game](/images//spectate_game.png)

## Scrypto
You will find two folder within the `scrypto` directory. One for the main blueprints (radichess) and one for an auction blueprint. The plan was to connect both so that once a chess game ended, an NFT would be minted and put on auction.

It was **@RockHoward**, **@beemdvp** and **@redfoo22** who worked on that part of the project.

### Radichess structure
Inside the radichess source folder, you will find different files. Here is a description of each file:

| File          | Description |
| ------------- | ----------- |
| radichess.rs  | This contains the main Scrypto blueprint of the project. It defines the structure for the players and the games, along with defining a blueprint that acts as a game manager. A component instantiated from this blueprint allows people to register as a player, start a new game and manages the list of games. |
| chess.rs      | This is a blueprint where each instantiated component represents a single game of chess. Players are able to get the status of the game, join the game, make a move and withdraw a part of the proceeds from the auctioned NFT. |
| board.rs      | This file is the heart of the chess engine. It stores the current state of the board, validates the moves and declares the winner once a checkmate is attained. |
| coordinate.rs | This provides a `Coordinate` structure, used by the chess engine, to represent a coordinate on the chess board. It provides useful methods to do calculations on the coordinates. |
| piece.rs      | This provides a `Piece` structure, again used by the chess engine, to represent a single piece and store some information like how many moves it did and its team. |
| lib.rs        | Scrypto packages always need a `lib.rs` file that describe the modules that it uses. This file simply reference the other files. |

## How to test

1. Download the PTE browser wallet [here](https://docs.radixdlt.com/main/scrypto/public-test-environment/pte-getting-started.html#_install_pte_browser_extension)
1. Go into the frontend directory: `cd frontend`
1. Install the dependencies: `npm install`
1. Start the local server: `npm start`
1. Open the following url in your browser: http://localhost:3000/
1. If this is the first time opening the app, you should see a button to create a profile. Click on it and type your username. You will then be asked to sign and submit a transaction from the PTE wallet. After running this transaction, you will receive a badge resource in your wallet that represents your identity in the system.
1. You should now reload the page to see the main dashboard
1. You can then create/join/spectate games
1. To view the leaderboard, go to http://localhost:3000/leaderboard
