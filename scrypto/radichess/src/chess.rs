//! TODO:
//! 1. Add a way for the game to end if one of the players takes too long to make a move.

use scrypto::prelude::*;
use crate::{
    coordinate::Coordinate,
    board::{Board, Fen}, 
    piece::Team, 
};

blueprint!{
    /// Represents a game of chess and the required state variables.
    struct Chess {
        /// The resource address of the resource used for the tracking of players.
        player1_id: NonFungibleId,
        player2_id: Option<NonFungibleId>,

        /// The epoch in which the last move was made by the players.
        last_move_epoch: u64,

        /// The board object which holds the board state and controls the rules of the game
        board: Board
    }
    
    impl Chess {
        /// instantiate (integrated with RadiChess)
        pub fn instantiate(player1, NonFungibleId) -> ComponentAddress {
            Self{
                player1_id: player1,
                board: Board::new(),
                player2_id: None,
                last_move_epoch: Runtime::current_epoch()
            }
        }

        /// Instantiates a new game of chess alongside the required player badges (old)
        pub fn instantiate_default() -> (ComponentAddress, Bucket) {
            Self::instantiate_with_board(Board::new())
        }

        /// Instantiates a new game with a fen string. (old)
        pub fn instantiate_with_fen(fen_string: String) -> (ComponentAddress, Bucket) {
            01fbdd80801496ad4444352561ac5ba9ae406e8c5aaa10b41b48ab            let fen: Fen = Fen {state: fen_string};
            Self::instantiate_with_board(Board::new_with_fen(fen))
        }
        
        /// Instantiates a new chess game with the board passed to it. (old)
        fn instantiate_with_board(board: Board) -> (ComponentAddress, Bucket) {
            // Creating the player tracking resource
            let player: Bucket = ResourceBuilder::new_non_fungible()
                .metadata("name", "Chess Player")
                .metadata("symbol", "CHESSP")
                .metadata("description", "A player in a game of chess.")
                .initial_supply([
                    (NonFungibleId::from_u32(0u32), Player { team: Team::Black }),
                    (NonFungibleId::from_u32(1u32), Player { team: Team::White })
                ]);

            // Creating the chess component
            let component_address: ComponentAddress = Self {
                player_resource_address: player.resource_address(),
                last_move_epoch: Runtime::current_epoch(),
                board: board
            }
            .instantiate()
            .add_access_check(AccessRules::new().default(rule!(allow_all)))
            .globalize();

            return (
                component_address,
                player
            );
        }

        /// Allows the player to move one of their pieces from one coordinate to another (old)
        pub fn move_piece(
            &mut self, 
            from: String,
            to: String,
            player_badge: Proof
        ) {
            // Verify that the badge provided is a valid player badge and get their team
            assert_eq!(player_badge.resource_address(), self.player_resource_address, "Invalid player badge");
            let player_team: Team = {
                let player: Player = player_badge.non_fungible().data();
                player.team
            };

            // Check to ensure that it is the turn of this team to play
            assert_eq!(self.board.turn_to_play(), player_team, "Not your turn to play");

            // Load up the coordinates from the passed tuples and make sure that they're valid coordinates
            match (
                Coordinate::try_from(from),
                Coordinate::try_from(to),
            ) {
                (Ok(from_coordinate), Ok(to_coordinate)) => {
                    // Make sure that the player is trying to move a piece that belongs to them.
                    match self.board.team_at_coordinate(&from_coordinate) {
                        Some(team) => {
                            if team == player_team {
                                self.board.move_piece(&from_coordinate, &to_coordinate).unwrap();
                                info!("Move has been made, current board is: \n{}", self.board);
                            } else {
                                assert!(false, "Can not move another player's piece") 
                            }
                        },
                        None => assert!(false, "Empty coordinate")
                    }
                },
                (_, _) => assert!(false, "Invalid coordinates passed to method") 
            }
        }
    }
}

/// Represents a chess player (old)
#[derive(NonFungibleData)]
struct Player {
    /// Represents the team of the player.
    team: Team
}