//! TODO:
//! 1. Add a way for the game to end if one of the players takes too long to make a move.

use scrypto::prelude::*;
use crate::{
    coordinate::Coordinate,
    board::{Board, Fen}, 
    piece::Team,
    radichess::RadiChessUser
};


// Represents a chess player (old)
// #[derive(NonFungibleData)]
// struct Player {
//    // Represents the team of the player.
//    team: Team
// };

blueprint!{
    // Represents a game of chess and the required state variables.
    pub struct Chess {
        /// The resource address of the resource used for the tracking of players.
        badge_resource: ResourceAddress,
        player1_id: NonFungibleId,
        player2_id: Option<NonFungibleId>,
        underway: bool,
        completed: bool,

        /// The epoch in which the last move was made by the players.
        last_move_epoch: u64,

        /// The board object which holds the board state and controls the rules of the game
        board: Board
    }

    impl Chess {
        /// instantiate (integrated with RadiChess)

        pub fn instantiate(player1: NonFungibleId, badgeRA: ResourceAddress)
        -> ComponentAddress {
            let access_rules = AccessRules::new().default(AccessRule::AllowAll);

            Self {
                badge_resource: badgeRA,
                player1_id: player1,
                board: Board::new(),
                player2_id: None,
                last_move_epoch: Runtime::current_epoch(),
                underway: false,
                completed: false
            }.instantiate().add_access_check(access_rules).globalize()
        }

        pub fn join(&mut self, badge: Proof) {
            // Go ahead and have player 2 make a move after this call.
            assert_eq!(badge.resource_address(), self.badge_resource);
            assert_eq!(self.underway, false);
            assert_eq!(self.completed, false);
            self.player2_id = Some(badge.non_fungible::<RadiChessUser>().id());
            assert_ne!(self.player1_id, self.player2_id.clone().unwrap());
            self.underway = true;
            self.last_move_epoch = Runtime::current_epoch()
        }
    }
}