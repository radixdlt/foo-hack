//! TODO:
//! 1. Add a way for the game to end if one of the players takes too long to make a move.

use scrypto::prelude::*;
use crate::{
    coordinate::Coordinate,
    board::{Board, Fen}, 
    piece::Team, 
};

/// Represents a chess player (old)
#[derive(NonFungibleData)]
struct Player {
    /// Represents the team of the player.
    team: Team
}

blueprint!{
    /// Represents a game of chess and the required state variables.
    pub struct Chess {
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

        pub fn instantiate(player1: NonFungibleId) -> ComponentAddress {
            let access_rules = AccessRules::new().default(AccessRule::AllowAll);

            Self {
                player1_id: player1,
                board: Board::new(),
                player2_id: None,
                last_move_epoch: Runtime::current_epoch()
            }.instantiate().add_access_check(access_rules).globalize()
        }
    }
}
