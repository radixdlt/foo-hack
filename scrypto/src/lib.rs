use scrypto::prelude::*;

#[derive(Debug, NonFungibleData)]
struct RadiChessUser {
    name: String,
    elo: u64
}

impl RadiChessUser {
    pub fn new(name: String, elo: u64) -> Self {
        Self {
            name,
            elo
        }
    }
}

blueprint! {
    struct RadiChess {
        // Define what resources and data will be managed by Hello components
        service_auth: Vault,
        user_vault: Vault
    }

    impl RadiChess {
        // Implement the functions and methods which will manage those resources and data
        
        // This is a function, and can be called directly on the blueprint once deployed
        pub fn create() -> ComponentAddress {
            let service_auth: Bucket = ResourceBuilder::new_fungible()
                .initial_supply(1);
            // Create a new token called "HelloToken," with a fixed supply of 1000, and put that supply into a bucket
            let radi_chess_user: Bucket = ResourceBuilder::new_fungible()
                .metadata("name", "RadiChess")
                .metadata("symbol", "HT")
                .initial_supply(1000);

            // Instantiate a Hello component, populating its vault with our supply of 1000 HelloToken
            Self {
                user_vault: Vault::with_bucket(radi_chess_user),
                service_auth: Vault::with_bucket(service_auth)
            }
            .instantiate()
            .globalize()
        }

        pub fn register_user(&self, name: String, elo: u64) -> Bucket {
            self.service_auth.authorize(|| {
                let user_id = self.user_vault.non_fungible_ids().len() + 1;
                borrow_resource_manager!(self.user_vault.resource_address()).mint_non_fungible(&NonFungibleId::from_u64(user_id as u64), RadiChessUser::new(name, elo))
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
