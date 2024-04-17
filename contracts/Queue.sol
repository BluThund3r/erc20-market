// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

//! IMPORTANT: modifica tipul de date din uint in ce iti trebuie tie (probabil ERC20)
contract Queue {
  mapping(uint256 => uint) queue;
  uint256 first = 1;
  uint256 last = 0;

  modifier queueNotEmpty() {
    require(last >= first, "Queue is empty");
    _;
  } 

  function push(uint data) public {
    queue[++ last] = data;
  }

  function pop() queueNotEmpty() public returns (uint data) {
    data = queue[first];
    delete queue[first ++];
  }

  function peek() queueNotEmpty() public view returns (uint data) {
    data = queue[first];
  }

  function length() public view returns (uint) {
    return last - first + 1;
  }

  function empty() public view returns (bool) {
    return last < first;
  }
}