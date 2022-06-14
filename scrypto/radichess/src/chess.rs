//! TODO:
//! 1. Add a way for the game to end if one of the players takes too long to make a move.

use crate::{
    board::{Board, Fen},
    coordinate::Coordinate,
    piece::Team,
};
use scrypto::prelude::*;
use serde::Serialize;

/// Represents a chess player (old)
#[derive(NonFungibleData)]
struct Player {
    /// Represents the team of the player.
    team: Team,
}

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

blueprint! {
    /// Represents a game of chess and the required state variables.
    pub struct Chess {
        /// The resource address of the resource used for the tracking of players.
        pub player1_id: NonFungibleId,
        pub player2_id: Option<NonFungibleId>,
        player1_team: Team,
        player2_team: Option<Team>,

        /// The epoch in which the last move was made by the players.
        last_move_epoch: u64,

        /// The board object which holds the board state and controls the rules of the game
        board: Board,
    }

    impl Chess {
        pub fn instantiate(player1: NonFungibleId) -> ComponentAddress {
            let access_rules = AccessRules::new().default(AccessRule::AllowAll);
            let board = Board::new();

            Self {
                player1_id: player1,
                player1_team: Team::Black,
                board,
                player2_id: None,
                player2_team: None,
                last_move_epoch: Runtime::current_epoch(),
            }
            .instantiate()
            .add_access_check(access_rules)
            .globalize()
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
                Outcome::Winner(self.get_player())
            } else {
                Outcome::Undecided
            } 
        }

        fn get_player(&self) -> String {
            if self.player1_team == self.board.winner().unwrap() {
                self.player1_id.to_string()
            } else {
                self.player2_id.clone().unwrap().to_string()
            }
        }

    }
}
