use scrypto::prelude::*;
use crate::chess::Chess;

#[derive(Debug, NonFungibleData)]
struct RadiChessUser {
    name: String,
    elo: u64,
}

impl RadiChessUser {
    pub fn new(name: String, elo: u64) -> Self {
        Self { name, elo }
    }
}

blueprint! {
    struct RadiChess {
        service_auth: Vault,
        user_resource: ResourceAddress,
        games: Vec<ComponentAddress>
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
                games: vec![]
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
            assert!(badge.resource_address() == self.user_resource, "Invalid Player Badge");
            // Now create the game and return the game component address
            let player_id = badge.non_fungible::<RadiChessUser>().id();
            let component = Chess::instantiate(player_id);

            self.games.push(component);

            component
        }

        // This is a method, because it needs a reference to self.  Methods can only be called on components
        // pub fn free_token(&mut self) -> Bucket {
        //     info!("My balance is: {} HelloToken. Now giving away a token!", self.sample_vault.amount());
        //     // If the semi-colon is omitted on the last line, the last value seen is automatically returned
        //     // In this case, a bucket containing 1 HelloToken is returned
        //     self.sample_vault.take(1)
        // }
    }
}
