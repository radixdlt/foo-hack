use scrypto::prelude::*;

#[derive(NonFungibleData)]
struct TicketData {
    #[scrypto(mutable)]
    amount:Decimal
}

blueprint! {
    struct Auction {
        bid_vault:Vault,
        nft_vault: Vault,
        ticket_authority_vault: Vault,
        bid_ticket_manager_address:ResourceAddress,
        highest_bid:Decimal,
        highest_bid_id:Option<NonFungibleId>,
        admin_badge_address:ResourceAddress,
        auction_end_epoch:u64

    }

    impl Auction {
        pub fn instantiate_auction(bucket:Bucket,duration:u64)-> (ComponentAddress,Bucket) {
            assert!(duration < 500, "That's too long!");

            let ticket_authority: Bucket = ResourceBuilder::new_fungible()
                .divisibility(DIVISIBILITY_NONE)
                .metadata("name", "Ticket Authority")
                .initial_supply(Decimal::one());

            let badge: Bucket = ResourceBuilder::new_fungible()
                .divisibility(DIVISIBILITY_NONE)
                .metadata("name", "Admin Baby")
                .burnable(rule!(require(ticket_authority.resource_address())),LOCKED)
                .initial_supply(dec!("1"));

            let bid_ticket_address:ResourceAddress = ResourceBuilder::new_non_fungible()
            .metadata("name", "Bid Ticket")
            .mintable(rule!(require(ticket_authority.resource_address())),LOCKED)
            .burnable(rule!(require(ticket_authority.resource_address())),LOCKED)
            .updateable_non_fungible_data(rule!(require(ticket_authority.resource_address())),LOCKED) 
            .no_initial_supply();

            let component_address = Self {

                bid_vault:Vault::new(RADIX_TOKEN),
                bid_ticket_manager_address: bid_ticket_address,
                ticket_authority_vault:Vault::with_bucket(ticket_authority),
                highest_bid:Decimal::zero(),
                nft_vault:Vault::with_bucket(bucket),
                highest_bid_id:None,
                admin_badge_address: badge.resource_address(),
                auction_end_epoch: Runtime::current_epoch() + duration

            }
            .instantiate().globalize();

            (component_address,badge)

        }
        pub fn bid(&mut self,bid:Bucket) -> Bucket {

            assert!(self.auction_end_epoch >= Runtime::current_epoch(),"Sorry Charlie. The Action has expired");

            assert!(bid.amount() > self.highest_bid," your bid is not higher then current bid. Please bid again with mo' money!");


            let ticket_id = NonFungibleId::random();

            let ticket: Bucket = self.ticket_authority_vault.authorize(|| {
                borrow_resource_manager!(self.bid_ticket_manager_address).mint_non_fungible(&ticket_id,TicketData {
                    amount:bid.amount()
                 })
            });

            self.highest_bid = bid.amount();
            self.highest_bid_id = Some(ticket_id); 

            self.bid_vault.put(bid);
            ticket
        }
        pub fn update_bid(&mut self,ticket:Proof,supplement:Bucket) {
            assert!(self.auction_end_epoch >= Runtime::current_epoch(),"Sorry Charlie. The Action has expired");
            assert!(ticket.resource_address() == self.bid_ticket_manager_address,"Don't try to fool me, that ticket doen't exsist.");

            let proof_nft: NonFungible<TicketData> = ticket.non_fungible();

            let mut proof_nft_data = proof_nft.data();

            proof_nft_data.amount = proof_nft_data.amount + supplement.amount();

            assert!(proof_nft_data.amount > self.highest_bid,"My dude are you crazy? Your update bid is not higher then the highest bid. Like why whould anybody except an amount lower then the highest offer?");

            self.highest_bid = proof_nft_data.amount;
            self.highest_bid_id = Some(proof_nft.id());
            self.bid_vault.put(supplement);

            self.ticket_authority_vault.authorize(|| {
                borrow_resource_manager!(self.bid_ticket_manager_address).update_non_fungible_data(&proof_nft.id(),proof_nft_data)
            });
        }

        pub fn withdraw(&mut self,ticket:Bucket)-> Bucket {
            assert!(self.auction_end_epoch < Runtime::current_epoch(),"Patience my friend. There's still time left on the auction");
            assert!(ticket.resource_address() == self.bid_ticket_manager_address,"Stop trying to steal money dude");
            assert!(ticket.amount() > Decimal::zero());
            let ticket_nft: NonFungible<TicketData> = ticket.non_fungible();

            let bucket_to_return = if ticket_nft.id() == self.highest_bid_id.clone().unwrap() { 
                self.nft_vault.take_all()
            } else {
                let amount = ticket_nft.data().amount;
                self.bid_vault.take(amount)
            };

            self.ticket_authority_vault.authorize(|| {
                ticket.burn();
            });

            return bucket_to_return;


        }

        pub fn withdraw_admin(&mut self,admin_ticket:Bucket)->Bucket {
            assert!(self.auction_end_epoch < Runtime::current_epoch(),"Patience my friend. There's still time left on the auction");
            assert!(admin_ticket.resource_address() == self.admin_badge_address,"Lol!!! Stop trying to steal money dude");
            assert!(admin_ticket.amount() > Decimal::zero());

            let nft_payment = self.highest_bid;

            self.ticket_authority_vault.authorize(|| {
                admin_ticket.burn();
            });


            return self.bid_vault.take(nft_payment)



        }
    
    }
}
