// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LP.sol";

contract LPRouter {
    mapping(address => mapping(address => address)) public pools;

    address[] public tokens;

    // Pentru dijkstra
    // Mapping to store the shortest distances from _tokenA
    mapping(address => uint256) public distances;
    // Mapping to store if a node was already visited
    mapping(address => bool) public visited;
    // Mapping to reconstruct path
    mapping(address => address) public previous;

    function addToken(IERC20 _token) public {
        bool tokenExists = false;
        for (uint i = 0; i < tokens.length; i++) {
            if (tokens[i] == address(_token)) {
                tokenExists = true;
                break;
            }
        }

        if (!tokenExists) {
            tokens.push(address(_token));
        }
    }

    // Observer Patern ???
    function createLP(IERC20 _tokenA, IERC20 _tokenB) public returns (LP) {
        LP lpContract = new LP(_tokenA, _tokenB);
        pools[address(_tokenA)][address(_tokenB)] = address(lpContract);
        // Add the tokens to the list of tokens
        addToken(_tokenA);
        addToken(_tokenB);
        return lpContract;
    }

    function dijkstra(
        IERC20 __tokenA,
        IERC20 __tokenB
    ) public returns (address[] memory) {
        uint256 MAX_UINT = type(uint256).max;

        address _tokenA = address(__tokenA);
        address _tokenB = address(__tokenB);

        // Initializing the path result
        address[] memory path;
        uint256 pathCount = 0;

        // Initialize distances and visited maps
        distances[_tokenA] = 0;
        visited[_tokenA] = false;

        address current = _tokenA;
        while (current != address(0) && current != _tokenB) {
            address next = address(0);
            uint256 shortest = MAX_UINT;

            // Update distances to neighboring nodes
            for (uint i = 0; i < getAllTokens().length; i++) {
                address neighbor = getAllTokens()[i];
                if (
                    pools[current][neighbor] != address(0) && !visited[neighbor]
                ) {
                    uint256 alt = distances[current] + 1; // Assume each edge has the same weight
                    if (alt < distances[neighbor]) {
                        distances[neighbor] = alt;
                        previous[neighbor] = current;
                    }
                }
            }

            // Finding the unvisited node with the smallest distance
            for (uint i = 0; i < getAllTokens().length; i++) {
                address neighbor = getAllTokens()[i];
                if (!visited[neighbor] && distances[neighbor] < shortest) {
                    shortest = distances[neighbor];
                    next = neighbor;
                }
            }

            // Mark as visited and move to the next node
            visited[current] = true;
            current = next;
        }

        // Reconstruct the path
        address step = _tokenB;
        if (previous[step] != address(0) || step == _tokenA) {
            while (step != address(0)) {
                path[pathCount++] = step;
                step = previous[step];
            }
        }

        // Reverse the path to correct the order from _tokenA to _tokenB
        address[] memory finalPath = new address[](pathCount);
        for (uint i = 0; i < pathCount; i++) {
            finalPath[i] = path[pathCount - 1 - i];
        }

        return finalPath;
    }

    function getAllTokens() internal view returns (address[] memory) {
        return tokens;
    }

    // function multiHopSwap(
    //     IERC20 _tokenIn,
    //     IERC20 _tokenOut,
    //     uint256 _amountIn
    // ) public {

    //     require(route.length >= 2, "Route must have at least two tokens");

    //     IERC20(route[0]).transferFrom(msg.sender, address(this), amount);
    //     uint256 swapAmount = amount;

    //     for (uint i = 0; i < route.length - 1; i++) {
    //         address currentToken = route[i];
    //         address nextToken = route[i+1];
    //         address poolAddress = pools[currentToken][nextToken];
    //         require(poolAddress != address(0), "Pool does not exist for this token pair");

    //         IERC20(currentToken).approve(poolAddress, swapAmount);
    //         swapAmount = LiquidityPool(poolAddress).swapToken1ForToken2(swapAmount, address(this));
    //     }

    //     IERC20(route[route.length - 1]).transfer(msg.sender, swapAmount);
    // }
    // }
}
