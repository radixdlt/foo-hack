use radix_engine::ledger::*;
use radix_engine::transaction::*;
use scrypto::prelude::*;

#[test]
fn test_hello() {
    // Set up environment.
    let mut ledger = InMemorySubstateStore::with_bootstrap();
    let mut executor = TransactionExecutor::new(&mut ledger, true);
    let (pk, sk, account) = executor.new_account();
    let (pk2, sk2, account2) = executor.new_account();
    let package = executor.publish_package(compile_package!()).unwrap();

    // Test the `instantiate_hello` function.
    let transaction1 = TransactionBuilder::new()
        .withdraw_from_account_by_amount(dec!("100"), RADIX_TOKEN, account)
        .take_from_worktop(RADIX_TOKEN, |builder, bucket_id| {
            builder.call_function(package, "Auction", "instantiate_auction", args![Bucket(bucket_id), 100u64])
        })
        .call_method_with_all_resources(account, "deposit_batch")
        .build(executor.get_nonce([pk]))
        .sign([&sk]);
    let receipt1 = executor.validate_and_execute(&transaction1).unwrap();
    println!("{:?}\n", receipt1);
    assert!(receipt1.result.is_ok());

    println!("{:?}", receipt1);
    let component_address = receipt1.new_component_addresses.get(0).unwrap();

    // Make a bid

    let tx2 = TransactionBuilder::new()
        .withdraw_from_account_by_amount(dec!("10"), RADIX_TOKEN, account)
        .take_from_worktop(RADIX_TOKEN, |builder, bucket_id| {
            builder.call_method(*component_address, "bid", args![Bucket(bucket_id)])
        })
        .call_method_with_all_resources(account, "deposit_batch")
        .build(executor.get_nonce([pk]))
        .sign([&sk]);

    let receipt2 = executor.validate_and_execute(&tx2).unwrap();
    println!("{:?}\n", receipt2);
    assert!(receipt2.result.is_ok());

    // Outbid from account2
    let tx3 = TransactionBuilder::new()
        .withdraw_from_account_by_amount(dec!("13"), RADIX_TOKEN, account2)
        .take_from_worktop(RADIX_TOKEN, |builder, bucket_id| {
            builder.call_method(*component_address, "bid", args![Bucket(bucket_id)])
        })
        .call_method_with_all_resources(account2, "deposit_batch")
        .build(executor.get_nonce([pk2]))
        .sign([&sk2]);

    let receipt3 = executor.validate_and_execute(&tx3).unwrap();
    println!("{:?}\n", receipt3);
    assert!(receipt3.result.is_ok());

    // End the auction
    executor.substate_store_mut().set_epoch(200);

    //Withdraw the 100XRD from account2
    let tx4 = TransactionBuilder::new()
        .create_proof_from_account(, account2)
        .call_method(account2, "deposit_batch")
        .build(executor.get_nonce([pk2]))
        .sign([&sk2]);

    let receipt3 = executor.validate_and_execute(&tx3).unwrap();
    println!("{:?}\n", receipt3);
    assert!(receipt3.result.is_ok());

    


    // Test the `free_token` method.
    // let component = receipt1.new_component_addresses[0];
    // let transaction2 = TransactionBuilder::new()
    //     .call_method(component, "free_token", args![])
    //     .call_method_with_all_resources(account, "deposit_batch")
    //     .build(executor.get_nonce([pk]))
    //     .sign([&sk]);
    // let receipt2 = executor.validate_and_execute(&transaction2).unwrap();
    // println!("{:?}\n", receipt2);
    // assert!(receipt2.result.is_ok());
}
