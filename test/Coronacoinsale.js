var Coronacoin = artifacts.require('./Coronacoin.sol');
var CoronacoinSale = artifacts.require('./CoronacoinSale.sol');

contract('CoronacoinSale', function(accounts) {
  var tokenInstance;
  var tokenSaleInstance;
  var admin = accounts[0];
  var buyer = accounts[1];
  var tokenPrice = 1000000000000000; // in wei
  var tokensAvailable = 750000;
  var numberOfTokens;

  it('initializes the contract with the correct values', function() {
    return CoronacoinSale.deployed().then(function(instance) {
      tokenSaleInstance = instance;
      return tokenSaleInstance.tokenContract();
    }).then(function(address) {
      assert.notEqual(address, 0x0, 'has token contract address');
      return tokenSaleInstance.tokenPrice();
    }).then(function(price) {
      assert.equal(price, tokenPrice, 'token price is correct')
    });
  });

  it('facilitates token buying', function() {
    return Coronacoin.deployed().then(function(instance) {
      // Grab token instance first
      tokenInstance = instance;
      return CoronacoinSale.deployed();
    }).then(function(instance) {
      // Then grab token sale instance
      tokenSaleInstance = instance;
      // Provision 75% of all tokens to token sale
      return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin })
    }).then(function(receipt) {
      // Buy some tokens
      numberOfTokens = 10;
      return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
      assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
      assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
      return tokenSaleInstance.tokensSold();
    }).then(function(amount) {
      assert.equal(amount.toNumber(), numberOfTokens, 'increments number of tokens sold');
      return tokenInstance.balanceOf(buyer);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), numberOfTokens, 'transfers balance to buyer');
      return tokenInstance.balanceOf(tokenSaleInstance.address);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), 749990, 'deducted from token sale contract balance');
      // Try to buy tokens different from the ether value
      return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, 'msg.value must equal number of tokens in wei');
    // Must transfer more ether to the account for this?
    //   numberOfTokens = 999999;
    //   return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice });
    // }).then(assert.fail).catch(function(error) {
    //   assert(error.message.indexOf('revert') >= 0, 'cannot buy more tokens than available');
      return tokenInstance.balanceOf(tokenSaleInstance.address);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), 749990, 'token sale balance did not change');
      return tokenSaleInstance.tokensSold();
    }).then(function(tokensSold) {
      assert.equal(tokensSold.toNumber(), 10, 'tokens sold did not change');
    });
  });

  it('ends token sale', function() {
    return Coronacoin.deployed().then(function(instance) {
      // Grab token instance first
      tokenInstance = instance;
      return CoronacoinSale.deployed();
    }).then(function(instance) {
      // Then grab token sale instance
      tokenSaleInstance = instance;
      // Try to end sale from account other than the admin
      return tokenSaleInstance.endSale({ from: buyer });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, 'must be admin to end sale');
      // End sale as admin
      return tokenSaleInstance.endSale({ from: admin });
    }).then(function(receipt) {
      return tokenInstance.balanceOf(admin);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), 999990, 'returns all unsold tokens to admin');
    });
  });
});