//! TODO:
//! 1. Add a way for the game to end if one of the players takes too long to make a move.

use crate::{
    board::{Board, Fen, GameStatus},
    coordinate::Coordinate,
    piece::Team,
    radichess::{GameJSON, Player, RadiChessUser},
};
use scrypto::prelude::*;
use serde::Serialize;

#[derive(Debug, Describe, Encode, Decode, TypeId, Serialize, PartialEq, Eq)]
pub enum Status {
    Awaiting,
    InProgress,
    Finished,
}

#[derive(Debug, Describe, Encode, Decode, TypeId, Serialize)]
pub enum Outcome {
    Winner(String),
    Draw,
    Undecided,
}

#[derive(Debug, Describe, Encode, Decode, TypeId, Serialize)]
pub enum GameResult {
    Win,
    Loss,
}

#[derive(Debug, NonFungibleData)]
pub struct ChessResultNFT {
    player1_name: String,
    player2_name: String,
    result: GameResult,
}

#[derive(Debug, NonFungibleData)]
pub struct ChessResultAuctionNFT {
    player1_name: String,
    player2_name: String,
    fen: String,
    winner: String,
}

macro_rules! pow {
    ($base:expr, $times:expr) => {{
        let mut total = $base;
        for _ in 1..$times {
            total = total * $times;
        }
        total
    }};
}

blueprint! {
    // Represents a game of chess and the required state variables.
    pub struct Chess {
        /// The resource address of the resource used for the tracking of players.
        service_auth: Vault,
        badge_resource: ResourceAddress,
        user_resource: ResourceAddress,
        player1_id: NonFungibleId,
        player2_id: Option<NonFungibleId>,
        player1_team: Team,
        player2_team: Option<Team>,
        underway: bool,
        completed: bool,
        fen: String,
        result_nft_resource: ResourceAddress,
        result_nft_badge: Vault,
        result_vault: Vault,

        /// The epoch in which the last move was made by the players.
        last_move_epoch: u64,

        /// The board object which holds the board state and controls the rules of the game
        board: Board,
    }

    impl Chess {
        /// instantiate (integrated with RadiChess)

        pub fn instantiate(
            player1: NonFungibleId,
            badge_resource: ResourceAddress,
            result_nft_resource: ResourceAddress,
            user_resource: ResourceAddress,
            result_nft_badge: Bucket,
        ) -> ComponentAddress {
            let service_auth = ResourceBuilder::new_fungible().initial_supply(1);

            let board = Board::new();

            info!("POW IS {:?}", pow!(4, 4));

            Self {
                service_auth: Vault::with_bucket(service_auth),
                result_nft_badge: Vault::with_bucket(result_nft_badge),
                user_resource,
                badge_resource,
                player1_id: player1,
                player1_team: Team::Black,
                fen: board.fen().state,
                board,
                player2_id: None,
                player2_team: None,
                result_nft_resource,
                result_vault: Vault::new(result_nft_resource),
                last_move_epoch: Runtime::current_epoch(),
                underway: false,
                completed: false,
            }
            .instantiate()
            .globalize()
        }

        pub fn get_game_info(&self) -> String {
            let player1_details: RadiChessUser = borrow_resource_manager!(self.user_resource)
                .get_non_fungible_data(&self.player1_id);

            let player2_details: Option<Player> = if self.player2_id.is_some() {
                let player2_details: RadiChessUser = borrow_resource_manager!(self.user_resource)
                    .get_non_fungible_data(&self.player2_id.clone().unwrap());
                Some(Player::new(
                    player2_details.name,
                    player2_details.elo.to_string(),
                    self.player2_id.clone().unwrap().to_string(),
                ))
            } else {
                None
            };

            let game = GameJSON::new(
                Runtime::actor().component_address().unwrap().to_string(),
                self.get_outcome(),
                self.get_status(),
                Player::new(
                    player1_details.name,
                    player1_details.elo.to_string(),
                    self.player1_id.to_string(),
                ),
                player2_details,
                Some(self.get_fen()),
            );

            serde_json_wasm::to_string(&game).unwrap()
        }

        pub fn join(&mut self, badge: Proof) {
            // Go ahead and have player 2 make a move after this call.
            assert_eq!(badge.resource_address(), self.badge_resource);
            assert_eq!(self.underway, false);
            assert_eq!(self.completed, false);
            self.player2_id = Some(badge.non_fungible::<RadiChessUser>().id());
            self.player2_team = Some(Team::White);
            assert_ne!(self.player1_id, self.player2_id.clone().unwrap());
            self.underway = true;
            self.last_move_epoch = Runtime::current_epoch()
        }

        pub fn move_piece(&mut self, from: String, to: String, player_badge: Proof) {
            // Verify that the badge provided is a valid player badge and get their team
            info!("GAME STATUS {:?}", self.get_status());
            assert!(self.get_status() != Status::Finished, "Game is finished");
            assert_eq!(
                player_badge.resource_address(),
                self.badge_resource,
                "Invalid player badge"
            );
            let player_team: Team = {
                let player_id = player_badge.non_fungible::<RadiChessUser>().id();

                if player_id == self.player1_id {
                    self.player1_team
                } else if player_id == self.player2_id.clone().unwrap() {
                    self.player2_team.unwrap()
                } else {
                    panic!("Invalid Player ID")
                }
            };

            // Check to ensure that it is the turn of this team to play
            assert_eq!(
                self.board.turn_to_play(),
                player_team,
                "Not your turn to play"
            );

            // Load up the coordinates from the passed tuples and make sure that they're valid coordinates
            match (Coordinate::try_from(from), Coordinate::try_from(to)) {
                (Ok(from_coordinate), Ok(to_coordinate)) => {
                    // Make sure that the player is trying to move a piece that belongs to them.
                    match self.board.team_at_coordinate(&from_coordinate) {
                        Some(team) => {
                            if team == player_team {
                                info!(
                                    "The team's status before the move is: {:?}",
                                    self.board.team_game_status(player_team.other())
                                );
                                self.board
                                    .move_piece(&from_coordinate, &to_coordinate)
                                    .unwrap();
                                info!(
                                    "The team's status after the move is: {:?}",
                                    self.board.team_game_status(player_team.other())
                                );

                                if self.get_status() == Status::Finished {
                                    self.update_elo();
                                }

                                info!("Move has been made, current board is: \n{}", self.board);
                            } else {
                                assert!(false, "Can not move another player's piece")
                            }
                        }
                        None => assert!(false, "Empty coordinate"),
                    }
                }
                (_, _) => assert!(false, "Invalid coordinates passed to method"),
            };

            self.fen = self.board.fen().state;
        }

        pub fn get_fen(&self) -> String {
            self.board.fen().state
        }

        fn update_elo(&self) {
            let k = dec!("32");
            let one = dec!("1");
            let ten = dec!("10");
            let fourhundred = dec!("400");

            let (winner_id, mut winner) = if self.board.winner().unwrap() == self.player1_team {
                (
                    self.player1_id.clone(),
                    borrow_resource_manager!(self.user_resource)
                        .get_non_fungible_data::<RadiChessUser>(&self.player1_id),
                )
            } else {
                (
                    self.player2_id.clone().unwrap(),
                    borrow_resource_manager!(self.user_resource)
                        .get_non_fungible_data::<RadiChessUser>(&self.player2_id.clone().unwrap()),
                )
            };

            let (loser_id, mut loser) = if self.board.winner().unwrap() != self.player1_team {
                (
                    self.player1_id.clone(),
                    borrow_resource_manager!(self.user_resource)
                        .get_non_fungible_data::<RadiChessUser>(&self.player1_id.clone()),
                )
            } else {
                (
                    self.player2_id.clone().unwrap(),
                    borrow_resource_manager!(self.user_resource)
                        .get_non_fungible_data::<RadiChessUser>(&self.player2_id.clone().unwrap()),
                )
            };

            let expected_w = (one
                / (one
                    + (pow!(
                        ten,
                        ((winner.elo - loser.elo) / fourhundred)
                            .round(0, RoundingMode::TowardsPositiveInfinity)
                            .max(dec!("1"))
                            .to_string()
                            .parse::<u64>()
                            .unwrap()
                    ))))
                * k;
            let expected_l = (one
                / (one
                    + (pow!(
                        ten,
                        ((loser.elo - winner.elo) / fourhundred)
                            .round(0, RoundingMode::TowardsPositiveInfinity)
                            .max(dec!("1"))
                            .to_string()
                            .parse::<u64>()
                            .unwrap()
                    ))))
                * k;

            self.result_nft_badge.authorize(|| {
                winner.elo = (winner.elo + expected_w * dec!("10")).round(0, RoundingMode::TowardsZero);
                info!("WINNER {:?}", winner.elo);
                borrow_resource_manager!(self.user_resource)
                    .update_non_fungible_data(&winner_id, winner);
                loser.elo = (loser.elo - expected_l * dec!("10")).round(0, RoundingMode::TowardsZero);
                info!("LOSER {:?}", loser.elo);
                borrow_resource_manager!(self.user_resource)
                    .update_non_fungible_data(&loser_id, loser);
            });
        }

        pub fn mint_game_result(&self) -> Bucket {
            assert!(self.get_status() == Status::Finished, "Game not finished");

            let winner = self.get_player_winner();

            self.result_nft_badge.authorize(|| {
                borrow_resource_manager!(self.result_nft_resource).mint_non_fungible(
                    &NonFungibleId::random(),
                    ChessResultAuctionNFT {
                        winner,
                        fen: self.board.fen().state,
                        player1_name: self.player1_id.to_string(),
                        player2_name: self.player2_id.clone().unwrap().to_string(),
                    },
                )
            })
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
