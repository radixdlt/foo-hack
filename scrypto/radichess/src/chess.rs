//! TODO:
//! 1. Add a way for the game to end if one of the players takes too long to make a move.

use scrypto::prelude::*;
use serde::Serialize;
use crate::{
    coordinate::Coordinate,
    board::{Board, Fen}, 
    piece::Team,
    radichess::RadiChessUser
};


#[derive(Debug, Describe, Encode, Decode, TypeId, Serialize)]
pub enum Status {
    Awaiting,
    InProgress,
    Finished
}

#[derive(Debug, Describe, Encode, Decode, TypeId, Serialize)]
pub enum Outcome {
    Winner(String),
    Draw,
    Undecided
}


blueprint!{
    // Represents a game of chess and the required state variables.
    pub struct Chess {
        /// The resource address of the resource used for the tracking of players.
        badge_resource: ResourceAddress,
        player1_id: NonFungibleId,
        player2_id: Option<NonFungibleId>,
        player1_team: Team,
        player2_team: Option<Team>,
        underway: bool,
        completed: bool,

        /// The epoch in which the last move was made by the players.
        last_move_epoch: u64,

        /// The board object which holds the board state and controls the rules of the game
        board: Board
    }

    impl Chess {
        /// instantiate (integrated with RadiChess)

        pub fn instantiate(player1: NonFungibleId, badge_resource: ResourceAddress)
        -> ComponentAddress {
            let access_rules = AccessRules::new().default(AccessRule::AllowAll);

            Self {
                badge_resource,
                player1_id: player1,
                player1_team: Team::Black,
                board: Board::new(),
                player2_id: None,
                player2_team: None,

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

        pub fn get_fen(&self) -> String {
            self.board.fen().state
        }

        pub fn get_players(&self) -> (NonFungibleId, Option<NonFungibleId>) {
            (self.player1_id.clone(), self.player2_id.clone())
        }

        pub fn get_status(&self) -> Status {
            if self.player2_id.is_none() {
                Status::Awaiting
            } else if self.board.winner().is_some() {
                Status::Finished
            } else {
                Status::InProgress
            }
        }

        pub fn get_outcome(&self) -> Outcome { 
            if self.board.winner().is_some() {
                Outcome::Winner(self.get_player_winner())
            } else {
                Outcome::Undecided
            } 
        }

        fn get_player_winner(&self) -> String {
            if self.player1_team == self.board.winner().unwrap() {
                self.player1_id.to_string()
            } else {
                self.player2_id.clone().unwrap().to_string()
            }
        }

    }
}
