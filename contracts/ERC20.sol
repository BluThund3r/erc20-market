// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "./IERC20.sol";

contract ERC20 is IERC20{
    uint256 nbTokens;   

    mapping(address => uint256) balances;
    mapping(address => mapping (address => uint256)) spendlimit;

    string public name;               
    uint8 public decimals = 18;                
    string public symbol;  

    event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
    event Transfer(address indexed from, address indexed to, uint tokens);


    modifier checkBalance (address owner, uint tokens) {
        require(tokens <= balances[owner], 'Insufficient funds!');
        _;
    }

    modifier checkApproval (address owner, address delegate, uint tokens) {
        require(tokens <= spendlimit[owner][delegate], 'Insufficient allowance!');
        _;
    }

    modifier constructorValidation(uint256 tokens, string memory _name, string memory _symbol) {
        require(tokens > 0, "Initial supply should be a positive integer");
        require(bytes(_name).length > 0, "Name should not be empty");
        require(bytes(_symbol).length > 0, "Symbol should not be empty");
        _;
    }

    constructor(uint256 tokens, string memory _name, string memory _symbol) constructorValidation(tokens, _name, _symbol) {
        nbTokens = tokens;
        name = _name;
        symbol = _symbol;
        balances[msg.sender] = tokens;
    }

    function totalSupply() public view returns (uint256) { 
        return nbTokens;
    }

    function balanceOf(address tokenOwner) public view returns (uint) { 
        return balances[tokenOwner]; 
    }

    function transfer(address receiver, uint tokens) public checkBalance (msg.sender ,tokens) 
								returns (bool) {   
        balances[msg.sender] = balances[msg.sender] - tokens;
        balances[receiver] = balances[receiver] + tokens;
        emit Transfer(msg.sender, receiver, tokens);
        return true;    
    }

    function approve(address spender, uint tokens)  public returns (bool) {
        spendlimit[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }

    function allowance(address tokenOwner, address spender) public view 
								returns(uint) {
        return spendlimit[tokenOwner][spender];
    }

    function transferFrom(address from, address to, uint tokens) 
            public  checkBalance (from, tokens) 
                    checkApproval(from, msg.sender, tokens) returns (bool) {
        
        balances[from] = balances[from] - tokens;
        spendlimit[from][msg.sender] = spendlimit[from][msg.sender]- tokens;
        balances[to] = balances[to] + tokens;
        emit Transfer(from, to, tokens);
        return true;
    }
}