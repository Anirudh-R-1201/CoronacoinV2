var Coronacoin = artifacts.require("./Coronacoin.sol")

contract('Coronacoin' , function(accounts){

    it('sets totalsupply to 1M ', function(){
        return Coronacoin.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply){
            assert.equal(totalSupply.toNumber(),1000000, 'set correct');
        });
    });

})