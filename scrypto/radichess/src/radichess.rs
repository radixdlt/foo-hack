use crate::chess::{Chess, Status, Outcome};
use scrypto::prelude::*;
use serde::Serialize;

#[derive(Debug, NonFungibleData)]
pub struct RadiChessUser {
    name: String,
    elo: u64,
}

impl RadiChessUser {
    pub fn new(name: String, elo: u64) -> Self {
        Self { name, elo }
    }
}

#[derive(Debug, Describe, Encode, Decode, TypeId, Serialize)]
struct Player {
    nickname: String,
    elo: String
}

impl Player {
    pub fn new(nickname: String, elo: String) -> Self {
        Self {
            nickname,
            elo,
        }
    }
}

#[derive(Debug, Describe, Encode, Decode, TypeId, Serialize)]
struct GameJSON {
    game_address: String,
    outcome: Outcome,
    status: Status,
    player1: Player,
    player2: Option<Player>
}

impl GameJSON {
    pub fn new(game_address: String, outcome: Outcome, status: Status, player1: Player, player2: Option<Player>) -> Self {
        Self {
            game_address,
            outcome,
            status,
            player1,
            player2,
        }
    }
}

blueprint! {
    struct RadiChess {
        service_auth: Vault,
        user_resource: ResourceAddress,
        games: Vec<ComponentAddress>,
    }

    impl RadiChess {
        pub fn create() -> ComponentAddress {
            let service_auth: Bucket = ResourceBuilder::new_fungible().initial_supply(1);
            // Create a new token called "HelloToken," with a fixed supply of 1000, and put that supply into a bucket
            let radi_chess_user = ResourceBuilder::new_non_fungible()
                .metadata("name", "RadiChess Player")
                .metadata("symbol", "RCP")
                .mintable(
                    rule!(require(service_auth.resource_address())),
                    Mutability::LOCKED,
                )
                .burnable(
                    rule!(require(service_auth.resource_address())),
                    Mutability::LOCKED,
                )
                .no_initial_supply();

            let access_rules = AccessRules::new().default(AccessRule::AllowAll);

            Self {
                user_resource: radi_chess_user,
                service_auth: Vault::with_bucket(service_auth),
                games: vec![],
            }
            .instantiate()
            .add_access_check(access_rules)
            .globalize()
        }

        pub fn register_player(&self, name: String, elo: u64) -> Bucket {
            self.service_auth.authorize(|| {
                borrow_resource_manager!(self.user_resource).mint_non_fungible(
                    &NonFungibleId::from_bytes(name.as_bytes().to_vec()),
                    RadiChessUser::new(name, elo),
                )
            })
        }

        pub fn start_game(&mut self, badge: Proof) -> ComponentAddress {
            // Check the Badge to make sure this is a chess player
            assert!(
                badge.resource_address() == self.user_resource,
                "Invalid Player Badge"
            );
            // Now create the game and return the game component address
            let player_id = badge.non_fungible::<RadiChessUser>().id();
            let component = Chess::instantiate(player_id, self.user_resource);

            self.games.push(component);

            component
        }

        pub fn list_games(&self) -> String {
            let found_games = self.games
                .clone()
                .into_iter()
                .map(|c| {
                    let component: Chess = c.clone().into();
                    let (player1, player2) = component.get_players();

                    let player1_details: RadiChessUser = borrow_resource_manager!(self.user_resource).get_non_fungible_data(&player1);

                    let player2_details: Option<Player> = if player2.is_some() {
                        let player2_details: RadiChessUser = borrow_resource_manager!(self.user_resource).get_non_fungible_data(&player2.unwrap());
                        Some(Player::new(player2_details.name, player2_details.elo.to_string()))
                    } else {
                        None
                    };

                    GameJSON::new(c.to_string(), Outcome::Undecided, Status::Awaiting, Player::new(player1_details.name, player1_details.elo.to_string()), player2_details)
                })
                .collect::<Vec<GameJSON>>();

            info!("{}", serde_json_wasm::to_string(&found_games).unwrap());

            serde_json_wasm::to_string(&found_games).unwrap()
        }

        pub fn list_games_by_player(&self, badge: Proof) -> String {
            let player_id = badge.non_fungible::<RadiChessUser>().id();

            let found_games = self.games
                .clone()
                .into_iter()
                .filter(|c| {
                    let component: Chess = c.clone().into();
                    let (player1, player2) = component.get_players();

                    match player2 {
                        Some(p) => {
                            player_id == p
                        },
                        None => {
                            player_id == player1
                        },
                    }
                })
                .map(|c| {
                    let component: Chess = c.clone().into();
                    let (player1, player2) = component.get_players();

                    let player1_details: RadiChessUser = borrow_resource_manager!(self.user_resource).get_non_fungible_data(&player1);

                    let player2_details: Option<Player> = if player2.is_some() {
                        let player2_details: RadiChessUser = borrow_resource_manager!(self.user_resource).get_non_fungible_data(&player2.unwrap());
                        Some(Player::new(player2_details.name, player2_details.elo.to_string()))
                    } else {
                        None
                    };

                    GameJSON::new(c.to_string(), Outcome::Undecided, Status::Awaiting, Player::new(player1_details.name, player1_details.elo.to_string()), player2_details)
                })
                .collect::<Vec<GameJSON>>();

            serde_json_wasm::to_string(&found_games).unwrap()
        }
    }
}
