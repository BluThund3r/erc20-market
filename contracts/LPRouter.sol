// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LP.sol";

contract LPRouter {
    // Definirea evenimentului pentru crearea unui nou LP
    // event LpCreated(address indexed LPaddress);

    // Observer Patern ???
    function createLP(IERC20 _tokenA, IERC20 _tokenB) public returns (LP) {
        LP lpContract = new LP(_tokenA, _tokenB);
        // emit LpCreated(address(this)); // Emiterea evenimentului în constructor
        return lpContract;
    }
}
