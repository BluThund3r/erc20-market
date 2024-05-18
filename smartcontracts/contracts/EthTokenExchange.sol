// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

// Import contractul ERC20
import "./ERC20.sol";
import "hardhat/console.sol";

// Contract care creaza un token ERC20 eth_token si permite schimbarea intre ETH si eth_token, pentru ca ETH sa fie folosit in LP
contract EthTokenExchange {
    event received(address indexed sender, uint256 value); // Event pentru primirea ETH
    event withdrawed(address indexed sender, uint256 value); // Event pentru trimiterea ETH

    // Variabile de stocare
    ERC20 public eth_token; // Variabilă pentru tokenul ERC20

    constructor() {
        // create a new ERC20 token
        eth_token = new ERC20(
            1000000000000000000000000000,
            "Ethereum Token",
            "ETH",
            true // aici poate trebuie sa fie true, dar nu sunt sigur
        );
        eth_token.setInitialBalance(address(this));
    }

    // cand primim ETH transmitem eth_token inapoi
    receive() external payable {
        eth_token.transfer(msg.sender, msg.value);
        emit received(msg.sender, msg.value);
        console.log("Received", msg.value, "ETH and sent eth_token to sender");
    }

    // functie care primeste eth_token si trimite inapoi ETH
    function token_to_ETH(uint256 _amount) public {
        eth_token.approveForUser(msg.sender, address(this), _amount);
        eth_token.transferFrom(msg.sender, address(this), _amount);
        payable(msg.sender).transfer(_amount);
        emit withdrawed(msg.sender, _amount);
        console.log("Received", _amount, "eth_token and sent ETH to sender");
    }
}
