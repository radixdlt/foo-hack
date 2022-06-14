use scrypto::prelude::*;

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
        user_vault: Vault,
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
                user_vault: Vault::new(radi_chess_user),
                service_auth: Vault::with_bucket(service_auth),
            }
            .instantiate()
            .add_access_check(access_rules)
            .globalize()
        }

        pub fn register_player(&self, name: String, elo: u64) -> Bucket {
            self.service_auth.authorize(|| {
                borrow_resource_manager!(self.user_vault.resource_address()).mint_non_fungible(
                    &NonFungibleId::from_bytes(name.as_bytes().to_vec()),
                    RadiChessUser::new(name, elo),
                )
            })
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
