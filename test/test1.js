const MultiSigWallet = artifacts.require("MultiSigWallet");
const truffleAssert = require('truffle-assertions');
const { assertion } = require('@openzeppelin/test-helpers/src/expectRevert');
var expect = require('expect.js');

contract("MultiSigWallet", (accounts) => {

    before(async () =>  {
        // Execute once before all tests
        MultiSigWalletInstance = await MultiSigWallet.deployed();
      });
    
    it("Deposit, Approve and Execute", async () => {
        
        // deposit 1 ETH to contract
        await web3.eth.sendTransaction({ from: accounts[0], to: MultiSigWalletInstance.address, value: 1*10**18 });
        
        // submit one transaction of 1 ether to account2
        const amount = 1;
        const submit = await MultiSigWalletInstance.submitTransaction(accounts[2], web3.utils.toWei(amount.toString()), "0x4554480000000000000000000000000000000000000000000000000000000000");
        const tx = await MultiSigWalletInstance.getTransaction(0);

        // check confirmation is 0
        assert.equal(tx[3], false, "It is already executed");
        assert.equal(tx[4].toNumber(), 0, "It has already one or more confirmations");

        //try to execute the transaction, it must fail   
        await truffleAssert.fails (
            MultiSigWalletInstance.executeTransaction(0)
        );
        
        // approve from account 3, must fail
        await truffleAssert.fails (
            MultiSigWalletInstance.approveTransaction(0, {from: accounts[3]})
        );

        // owners approve 
        const tx2 = await MultiSigWalletInstance.approveTransaction(0, {from: accounts[0]});
        const tx3 = await MultiSigWalletInstance.approveTransaction(0, {from: accounts[1]});
        const tx4 = await MultiSigWalletInstance.approveTransaction(0, {from: accounts[2]});

        // receiver balance pre execution
        const receiver_balance_pre = await web3.eth.getBalance(accounts[2]);

        // get transaction number of confirmation, it must be 3
        const confirmations = await MultiSigWalletInstance.confirmations.call();
        const tx5 = await MultiSigWalletInstance.getTransaction(0);
        assert.equal(web3.utils.fromWei(tx5[4]), web3.utils.fromWei(confirmations), "Not enough confirmations to execute");

        // try to execute with no owner, must fail
        await truffleAssert.fails (
            MultiSigWalletInstance.executeTransaction(0, {from: accounts[3]})
        );

        // final execution
        const tx6 = await MultiSigWalletInstance.executeTransaction(0, {from: accounts[0]});

        // receiver balance post execution
        const receiver_balance_post = await web3.eth.getBalance(accounts[2]);

        // check receiver balance incremented of transaction amount
        assert.equal((web3.utils.fromWei(receiver_balance_post)-web3.utils.fromWei(receiver_balance_pre)), amount, "Balances don't match");
    });

});