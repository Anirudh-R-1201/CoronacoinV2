var Coronacoin = artifacts.require("./Coronacoin.sol");
var CoronacoinSale = artifacts.require("./CoronacoinSale.sol");

module.exports = function(deployer) {
  // Deploy contract with total token supply of 1,000,000 tokens
  deployer.deploy(Coronacoin, 1000000).then(function() {
    var tokenPrice = 1000000000000000; // in wei
    return deployer.deploy(CoronacoinSale, Coronacoin.address, tokenPrice);
  });
};