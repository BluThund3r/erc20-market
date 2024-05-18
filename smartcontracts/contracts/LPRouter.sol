// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./LP.sol";
import "./Queue.sol";
import "./ERC20.sol";
import "./MinPath.sol";

contract LPRouter {
    using MinPath for *;
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

    event TokenCreated(
        address indexed tokenAddress,
        string indexed name,
        string indexed symbol,
        uint256 totalTokens
    );
    event LPCreated(
        address indexed lpAddress,
        address indexed tokenA,
        address indexed tokenB
    );
    event LogLPAddress(address indexed lpAddress);
    event LogTokenAddress(address indexed tokenAddress);
    event LogPath(address[] indexed path);
    event LogToken(
        string indexed tokenName,
        string indexed tokenSymbol,
        uint256 indexed totalTokens
    );

    modifier lpNotExistent(address _tokenA, address _tokenB) {
        require(pools[_tokenA][_tokenB] == address(0), "LP already exists");
        _;
    }

    modifier tokenNotExistent(string memory _name) {
        for (uint i = 0; i < tokens.length; i++) {
            ERC20 token = ERC20(tokens[i]);
            if (
                keccak256(abi.encodePacked(token.name())) ==
                keccak256(abi.encodePacked(_name))
            ) {
                // can't directly compare strings (idk why)
                revert("Token already exists");
            }
        }
        _;
    }

    constructor(address queueAddress) {
        if (queueAddress != address(0)) queue = Queue(queueAddress);
        else queue = new Queue();
    }

    // BFS to find the shortest path between two tokens
    function minPath(
        IERC20 _tokenA,
        IERC20 _tokenB
    ) public returns (address[] memory) {
        address[] memory path = MinPath.minPath(
            address(_tokenA),
            address(_tokenB),
            pools,
            tokens,
            visited,
            previous,
            visitedTokens,
            queue
        );

        emit LogPath(path);
        return path;
    }

    function getLPsForPath(
        address[] memory path
    ) private view returns (address[] memory) {
        address[] memory lps = new address[](path.length - 1);
        for (uint i = 0; i < path.length - 1; i++) {
            lps[i] = pools[path[i]][path[i + 1]];
        }
        return lps;
    }

    function testLPs(address _tokenA, address _tokenB) public {
        address[] memory path = minPath(IERC20(_tokenA), IERC20(_tokenB));
        for (uint i = 0; i < path.length; i++) {
            emit LogTokenAddress(path[i]);
        }
        address[] memory lps = getLPsForPath(path);
        for (uint i = 0; i < lps.length; i++) {
            emit LogLPAddress(lps[i]);
        }
    }

    function testMinPath(address _tokenA, address _tokenB) public {
        address[] memory path = minPath(IERC20(_tokenA), IERC20(_tokenB));
        for (uint i = 0; i < path.length; i++) {
            emit LogTokenAddress(path[i]);
        }
    }

    function myTokens()
        public
        view
        returns (string[] memory, string[] memory, uint256[] memory)
    {
        string[] memory tokenNames = new string[](tokens.length);
        string[] memory tokenSymbols = new string[](tokens.length);
        uint256[] memory balances = new uint256[](tokens.length);

        for (uint i = 0; i < tokens.length; i++) {
            ERC20 token = ERC20(tokens[i]);
            uint256 myBalance = token.balanceOf(msg.sender);
            if (myBalance > 0) {
                tokenNames[i] = token.name();
                tokenSymbols[i] = token.symbol();
                balances[i] = myBalance;
            }
        }

        return (tokenNames, tokenSymbols, balances);
    }

    function createToken(
        uint256 totalTokens,
        string memory _name,
        string memory _symbol
    ) public tokenNotExistent(_name) {
        IERC20 token = new ERC20(totalTokens, _name, _symbol, true);
        token.setInitialBalance(msg.sender);
        addToken(token);
        emit TokenCreated(address(token), _name, _symbol, totalTokens);
    }

    function swap(IERC20 _tokenIn, IERC20 _tokenOut, uint256 _amountIn) public {
        if (pools[address(_tokenIn)][address(_tokenOut)] != address(0)) {
            LP lpContract = LP(pools[address(_tokenIn)][address(_tokenOut)]);
            _tokenIn.approveForUser(msg.sender, address(lpContract), _amountIn); // approve the LP contract to spend the tokens
            lpContract.swap(msg.sender, _tokenIn, _amountIn);
            return;
        }

        address[] memory path = minPath(_tokenIn, _tokenOut);
        require(path.length > 0, "No path found between tokens");

        address[] memory lps = getLPsForPath(path);
        uint256 swapAmount = _amountIn;
        IERC20 fromToken = _tokenIn;
        for (uint i = 0; i < lps.length; i++) {
            LP lpContract = LP(lps[i]);
            fromToken.approveForUser(
                msg.sender,
                address(lpContract),
                swapAmount
            ); // approve the LP contract to spend the tokens
            swapAmount = lpContract.swap(msg.sender, fromToken, swapAmount);
            fromToken = lpContract.getOtherToken(fromToken);
        }
    }

    function getTokens()
        public
        view
        returns (string[] memory, string[] memory, address[] memory)
    {
        string[] memory tokenNames = new string[](tokens.length);
        string[] memory tokenSymbols = new string[](tokens.length);
        address[] memory tokenAddresses = new address[](tokens.length);

        for (uint i = 0; i < tokens.length; i++) {
            ERC20 token = ERC20(tokens[i]);
            tokenNames[i] = token.name();
            tokenSymbols[i] = token.symbol();
            tokenAddresses[i] = tokens[i];
        }

        return (tokenNames, tokenSymbols, tokenAddresses);
    }

    function addToken(IERC20 _token) public {
        for (uint i = 0; i < tokens.length; i++)
            if (tokens[i] == address(_token)) return;

        tokens.push(address(_token));
    }

    function createLP(
        address _tokenAAddress,
        address _tokenBAddress
    ) public lpNotExistent(_tokenAAddress, _tokenBAddress) returns (LP) {
        IERC20 _tokenA = IERC20(_tokenAAddress);
        IERC20 _tokenB = IERC20(_tokenBAddress);
        LP lpContract = new LP(_tokenA, _tokenB);
        pools[address(_tokenA)][address(_tokenB)] = address(lpContract);
        pools[address(_tokenB)][address(_tokenA)] = address(lpContract);
        addToken(_tokenA);
        addToken(_tokenB);
        emit LPCreated(address(lpContract), address(_tokenA), address(_tokenB));
        return lpContract;
    }

    // function getAllTokens() internal view returns (address[] memory) {
    //     return tokens;
    // }

    function getLP(
        address _tokenA,
        address _tokenB
    ) public view returns (address) {
        return pools[_tokenA][_tokenB];
    }

    function getLPs()
        public
        view
        returns (
            address[] memory,
            address[] memory,
            address[] memory,
            string[] memory,
            string[] memory
        )
    {
        address[] memory lps = new address[](tokens.length * tokens.length);
        address[] memory tokenAaddresses = new address[](
            tokens.length * tokens.length
        );
        address[] memory tokenBaddresses = new address[](
            tokens.length * tokens.length
        );
        string[] memory tokenAnames = new string[](
            tokens.length * tokens.length
        );
        string[] memory tokenBnames = new string[](
            tokens.length * tokens.length
        );
        uint index = 0;
        for (uint i = 0; i < tokens.length; i++) {
            for (uint j = i + 1; j < tokens.length; j++) {
                if (pools[tokens[i]][tokens[j]] != address(0)) {
                    lps[index] = pools[tokens[i]][tokens[j]];
                    tokenAaddresses[index] = tokens[i];
                    tokenBaddresses[index] = tokens[j];
                    ERC20 tokenA = ERC20(tokens[i]);
                    tokenAnames[index] = tokenA.symbol();
                    ERC20 tokenB = ERC20(tokens[j]);
                    tokenBnames[index] = tokenB.symbol();
                    index++;
                }
            }
        }

        return (
            lps,
            tokenAaddresses,
            tokenBaddresses,
            tokenAnames,
            tokenBnames
        );
    }
}
