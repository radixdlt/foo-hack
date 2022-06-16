use crate::chess::{Chess, Outcome, Status};
use scrypto::{component, prelude::*};
use serde::Serialize;

#[derive(Debug, NonFungibleData)]
pub struct RadiChessUser {
    pub name: String,
    #[scrypto(mutable)]
    pub elo: Decimal,
}

impl RadiChessUser {
    pub fn new(name: String, elo: Decimal) -> Self {
        Self { name, elo }
    }
}

#[derive(Debug, Describe, Encode, Decode, TypeId, Serialize)]
pub struct Player {
    player_id: String,
    nickname: String,
    elo: String,
}

impl Player {
    pub fn new(nickname: String, elo: String, player_id: String) -> Self {
        Self {
            nickname,
            elo,
            player_id,
        }
    }
}

#[derive(Debug, Describe, Encode, Decode, TypeId, Serialize)]
pub struct GameJSON {
    game_address: String,
    outcome: Outcome,
    status: Status,
    player1: Player,
    player2: Option<Player>,
    fen: Option<String>,
}

impl GameJSON {
    pub fn new(
        game_address: String,
        outcome: Outcome,
        status: Status,
        player1: Player,
        player2: Option<Player>,
        fen: Option<String>,
    ) -> Self {
        Self {
            game_address,
            outcome,
            status,
            player1,
            player2,
            fen,
        }
    }
}

blueprint! {
    struct RadiChess {
        service_auth: Vault,
        user_resource: ResourceAddress,
        result_minter_badge: ResourceAddress,
        result_nft_resource: ResourceAddress,
        games: Vec<ComponentAddress>,
        players: Vec<NonFungibleId>,
    }

    impl RadiChess {
        pub fn create() -> ComponentAddress {
            let service_auth: Bucket = ResourceBuilder::new_fungible().initial_supply(1);

            let result_minter_badge = ResourceBuilder::new_fungible()
                .mintable(
                    rule!(require(service_auth.resource_address())),
                    Mutability::LOCKED,
                )
                .no_initial_supply();
            // Create a new token called "HelloToken," with a fixed supply of 1000, and put that supply into a bucket
            let radi_chess_user = ResourceBuilder::new_non_fungible()
                .metadata("name", "RadiChess Player")
                .metadata("symbol", "RCP")
                .mintable(
                    rule!(require(service_auth.resource_address())),
                    Mutability::LOCKED,
                )
                .updateable_non_fungible_data(
                    rule!(require(result_minter_badge)),
                    Mutability::LOCKED,
                )
                .burnable(
                    rule!(require(service_auth.resource_address())),
                    Mutability::LOCKED,
                )
                .no_initial_supply();

            let result_nft_resource = ResourceBuilder::new_non_fungible()
                .mintable(rule!(require(result_minter_badge)), Mutability::LOCKED)
                .restrict_withdraw(rule!(deny_all), Mutability::LOCKED)
                .no_initial_supply();

            let access_rules = AccessRules::new().default(AccessRule::AllowAll);

            Self {
                user_resource: radi_chess_user,
                result_minter_badge,
                result_nft_resource,
                service_auth: Vault::with_bucket(service_auth),
                games: vec![],
                players: vec![],
            }
            .instantiate()
            .add_access_check(access_rules)
            .globalize()
        }

        pub fn register_player(&mut self, name: String, elo: Decimal) -> Bucket {
            let id = NonFungibleId::from_bytes(name.as_bytes().to_vec());
            self.players.push(id.clone());
            self.service_auth.authorize(|| {
                borrow_resource_manager!(self.user_resource)
                    .mint_non_fungible(&id, RadiChessUser::new(name, elo))
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

            let result_minter_badge = self
                .service_auth
                .authorize(|| borrow_resource_manager!(self.result_minter_badge).mint(1));

            let component = Chess::instantiate(
                player_id,
                self.user_resource,
                self.result_nft_resource,
                self.user_resource,
                result_minter_badge,
            );

            self.games.push(component);

            component
        }

        pub fn list_games(&self) -> String {
            let found_games = self
                .games
                .clone()
                .into_iter()
                .map(|c| {
                    let component: Chess = c.clone().into();
                    let (player1, player2) = component.get_players();

                    let player1_details: RadiChessUser =
                        borrow_resource_manager!(self.user_resource)
                            .get_non_fungible_data(&player1);

                    let player2_details: Option<Player> = if player2.is_some() {
                        let player2_details: RadiChessUser =
                            borrow_resource_manager!(self.user_resource)
                                .get_non_fungible_data(&player2.clone().unwrap());
                        Some(Player::new(
                            player2_details.name,
                            player2_details.elo.to_string(),
                            player2.clone().unwrap().to_string(),
                        ))
                    } else {
                        None
                    };

                    GameJSON::new(
                        c.to_string(),
                        component.get_outcome(),
                        component.get_status(),
                        Player::new(
                            player1_details.name,
                            player1_details.elo.to_string(),
                            player1.to_string(),
                        ),
                        player2_details,
                        None,
                    )
                })
                .collect::<Vec<GameJSON>>();

            info!("{}", serde_json_wasm::to_string(&found_games).unwrap());

            serde_json_wasm::to_string(&found_games).unwrap()
        }

        pub fn list_players(&self) -> String {
            let players = self.players.iter().map(|id| {
                let player = borrow_resource_manager!(self.user_resource).get_non_fungible_data::<RadiChessUser>(&id);
                Player::new(player.name, player.elo.to_string(), id.to_string())
            })
            .collect::<Vec<Player>>();

            serde_json_wasm::to_string(&players).unwrap()
        }
    }
}
