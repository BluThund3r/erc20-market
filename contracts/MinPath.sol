// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./Queue.sol";

library MinPath {
    function minPath(
        address _tokenA,
        address _tokenB,
        mapping(address => mapping(address => address)) storage pools,
        address[] storage tokens,
        mapping(address => bool) storage visited,
        mapping(address => address) storage previous,
        address[] storage visitedTokens,
        Queue queue
    ) internal returns (address[] memory) {
        queue.clear();
        queue.push(_tokenA);
        previous[_tokenA] = address(0);
        bool foundPath = false;

        while(!queue.empty()) {
            address current = queue.pop();
            if(current == _tokenB) {
                foundPath = true;
                break;
            }

            if(visited[current])
                continue;
            
            visited[current] = true;
            visitedTokens.push(current);
               
            for (uint i = 0; i < tokens.length; i++) {
                address neighbor = tokens[i];
                if (
                    pools[current][neighbor] != address(0) && !visited[neighbor]
                ) {
                    queue.push(neighbor);
                    previous[neighbor] = current;
                }
            }
        }
        
        if(!foundPath)
            return new address[](0);

        address[] memory path = buildPath(_tokenB, tokens, previous);
        clearVisited(visited, visitedTokens);
        return path;
  }

    function buildPath(
        address destToken, 
        address[] storage tokens,
        mapping(address => address) storage previous
    ) internal view returns (address[] memory) {
        address[] memory path = new address[](tokens.length);
        address currToken = destToken;
        uint256 pathCount = 0;
        while(currToken != address(0)) {
            path[pathCount++] = currToken;
            currToken = previous[currToken];
        }

        address[] memory finalPath = new address[](pathCount);
        for (uint i = 0; i < pathCount; i++) {
            finalPath[i] = path[pathCount - 1 - i];
        }

        return finalPath;
    }

    function clearVisited(
        mapping(address => bool) storage visited, 
        address[] storage visitedTokens
    ) internal {
        for (uint i = 0; i < visitedTokens.length; i++) {
            visited[visitedTokens[i]] = false;
            delete visitedTokens[i];
        }
    }
}