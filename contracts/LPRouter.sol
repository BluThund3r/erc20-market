// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LP.sol";
import "./Queue.sol";

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

    // array to store the visited tokens so that we can clear them later
    address[] private visitedTokens;

    // queue needed for BFS (shortest path)
    Queue queue;

    event LPCreated(address indexed lpAddress, address indexed tokenA, address indexed tokenB);
    event LogLPAddress(address indexed lpAddress);
    event LogTokenAddress(address indexed tokenAddress);

    constructor(address queueAddress) {
        if(queueAddress != address(0))
            queue = Queue(queueAddress);
        else
            queue = new Queue();
    }

    // BFS to find the shortest path between two tokens
    function minPath(
        IERC20 _tokenA,
        IERC20 _tokenB
    ) private returns (address[] memory) {
        address[] memory allTokens = getAllTokens(); 

        queue.clear();
        queue.push(address(_tokenA));
        previous[address(_tokenA)] = address(0);
        bool foundPath = false;

        while(!queue.empty()) {
            address current = queue.pop();
            if(current == address(_tokenB)) {
                foundPath = true;
                break;
            }

            if(visited[current])
                continue;
            
            visited[current] = true;
            visitedTokens.push(current);
               
            for (uint i = 0; i < allTokens.length; i++) {
                address neighbor = allTokens[i];
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

        address[] memory path = buildPath(address(_tokenB));
        clearVisited();
        return path;
    }

    function buildPath(address destToken) private view returns (address[] memory) {
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

    function clearVisited() private {
        for (uint i = 0; i < visitedTokens.length; i++) {
            visited[visitedTokens[i]] = false;
        }
        visitedTokens = new address[](0);
    }

    function getLPsForPath(address[] memory path) private view returns (address[] memory) {
        address[] memory lps = new address[](path.length - 1);
        for (uint i = 0; i < path.length - 1; i++) {
            lps[i] = pools[path[i]][path[i + 1]];
        }
        return lps;
    }

    function testLPs(address _tokenA, address _tokenB) public {
        address[] memory path = minPath(IERC20(_tokenA), IERC20(_tokenB));
        for(uint i = 0; i < path.length; i++) {
            emit LogTokenAddress(path[i]);
        }
        address[] memory lps = getLPsForPath(path);
        for (uint i = 0; i < lps.length; i++) {
            emit LogLPAddress(lps[i]);
        }
    }

    function swap(
        IERC20 _tokenIn,
        IERC20 _tokenOut,
        uint256 _amountIn
    ) public {
        if(pools[address(_tokenIn)][address(_tokenOut)] != address(0)) {
            LP lpContract = LP(pools[address(_tokenIn)][address(_tokenOut)]);
            lpContract.swap(msg.sender, _tokenIn, _amountIn);
            return;
        }

        address[] memory path = minPath(_tokenIn, _tokenOut);
        require(path.length > 0, "No path found between tokens");

        address[] memory lps = getLPsForPath(path);
        uint256 swapAmount = _amountIn;
        IERC20 fromToken = _tokenIn;
        for(uint i = 0; i < lps.length; i++) {
            LP lpContract = LP(lps[i]);
            swapAmount = lpContract.swap(msg.sender, fromToken, swapAmount);
            fromToken = lpContract.getOtherToken(fromToken);
        }
    }

    function addToken(IERC20 _token) public {
        for (uint i = 0; i < tokens.length; i++) 
            if (tokens[i] == address(_token)) 
                return;
            
        tokens.push(address(_token));
    }

    function createLP(IERC20 _tokenA, IERC20 _tokenB) public returns (LP) {
        LP lpContract = new LP(_tokenA, _tokenB);
        pools[address(_tokenA)][address(_tokenB)] = address(lpContract);
        pools[address(_tokenB)][address(_tokenA)] = address(lpContract);
        // Add the tokens to the list of tokens
        addToken(_tokenA);
        addToken(_tokenB);
        emit LPCreated(address(lpContract), address(_tokenA), address(_tokenB));
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
        address[] memory path = new address[](tokens.length);
        uint256 pathCount = 0;

        for (uint i = 0; i < tokens.length; i++) {
            address addr = tokens[i];
            distances[addr] = type(uint256).max;
            visited[addr] = false;
            previous[addr] = address(0);
        }
        
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

    function getLP(address _tokenA, address _tokenB) public view returns (address) {
        return pools[_tokenA][_tokenB];
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
