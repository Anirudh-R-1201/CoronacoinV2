pragma solidity >=0.4.21;

contract Coronacoin {
    //variables required for ERC 20 std
    string public name = "CoronaCoin";
    string public symbol = "cc";
    string public standard = "CoronaCoin V1.0";
    uint8 public decimals = 18; //set to wei value
    uint256 public totalSupply;

    //wallet ledger
    mapping(address => uint) public balanceOf;

    //tranfers ledger
    mapping(address => mapping(address=>uint256)) public allowance;
    


    //events as per erc20 specification
    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    //setup of new Coronacoin user
    constructor(uint _initialSupply) public {
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
    }

    //erc20 required functions
    function transfer(address _to, uint256 _value) public returns (bool success){
        //need value in sender to send tokens
        require(balanceOf[msg.sender]>=_value);

        //transfer tokens in wallets
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        //trigger event
        emit Transfer(msg.sender,_to,_value);

        return true;
    }

    //approve contracts to access of account 
    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    function transferFrom(address _from, address _to, uint _value) public returns (bool success) {
        require(balanceOf[_from] >= _value);
        require(allowance[_from][msg.sender] >= _value);

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);

        return true;
    }
    
}