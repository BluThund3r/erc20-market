// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Queue {
  mapping(uint256 => address) queue;
  uint256 first = 1;
  uint256 last = 0;

  modifier queueNotEmpty() {
    require(last >= first, "Queue is empty");
    _;
  } 

  function push(address data) public {
    queue[++ last] = data;
  }

  function pop() queueNotEmpty() public returns (address data) {
    data = queue[first];
    delete queue[first ++];
  }

  function peek() queueNotEmpty() public view returns (address data) {
    data = queue[first];
  }

  function length() public view returns (uint) {
    return last - first + 1;
  }

  function empty() public view returns (bool) {
    return last < first;
  }

  function clear() public {
    if(last < 1)
      return;

    for (uint i = 0; i <= last; i ++) {
      delete queue[i];
    }
    first = 1;
    last = 0;
  }
}