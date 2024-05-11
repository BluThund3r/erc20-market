// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LP.sol";
import "./Queue.sol";

contract LPRouter {
    mapping(address => mapping(address => address)) public pools;

    address[] public tokens;

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
    event LogPath(address[] indexed path);

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
    ) public returns (address[] memory) {
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
        emit LogPath(path);
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

    function testMinPath(address _tokenA, address _tokenB) public {
        address[] memory path = minPath(IERC20(_tokenA), IERC20(_tokenB));
        for(uint i = 0; i < path.length; i++) {
            emit LogTokenAddress(path[i]);
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

    function getAllTokens() internal view returns (address[] memory) {
        return tokens;
    }

    function getLP(address _tokenA, address _tokenB) public view returns (address) {
        return pools[_tokenA][_tokenB];
    }
}
