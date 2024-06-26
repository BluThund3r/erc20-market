// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IERC20.sol";

contract LP {
    uint256 public constant DECIMAL_FACTOR = 1e9;

    IERC20 public tokenA;
    IERC20 public tokenB;
    uint256 public reserveA;
    uint256 public reserveB;
    mapping(address => uint256) public lpTokens;
    uint256 public totalLPTokens;

    event Swapped(
        address indexed fromToken,
        address indexed toToken,
        uint256 amountIn,
        uint256 amountOut
    );

    event AddedLiquidity(
        address indexed tokenA,
        address indexed tokenB,
        uint256 amountA,
        uint256 amountB
    );

    event RemovedLiquidity(
        address indexed tokenA,
        address indexed tokenB,
        uint256 amountA,
        uint256 amountB
    );

    modifier notAlreadyInitialized() {
        // Require that the contract has not been initialized yet
        require(reserveA == 0 && reserveB == 0, "Already initialized");
        _;
    }

    modifier validSwapAmount(IERC20 fromToken, uint256 amountIn) {
        uint256 amountOut = getReturn(fromToken, amountIn);
        require(amountOut > 0, "Invalid swap amount");
        _;
    }

    modifier validTokenAddress(IERC20 fromToken) {
        require(
            (fromToken == tokenA || fromToken == tokenB),
            "Invalid token address"
        );
        _;
    }

    modifier enoughLiquidityInPool(uint256 liquidityTokens) {
        (uint amountA, uint amountB) = getLiquidityEquivalent(liquidityTokens);
        require(
            amountA <= reserveA && amountB <= reserveB,
            "Insufficient liquidity"
        );
        _;
    }

    modifier enoughLiquidityForUser(address user, uint256 liquidityTokens) {
        require(
            lpTokens[user] >= liquidityTokens,
            "Insufficient liquidity tokens"
        );
        _;
    }

    constructor(IERC20 _tokenA, IERC20 _tokenB) {
        tokenA = _tokenA;
        tokenB = _tokenB;
        totalLPTokens = 0;
    }

    //! only call this function BEFORE adding the liquidity to the reserves
    function computeLiquidityTokens(uint256 amountA) private view returns (uint256) {
        return totalLPTokens * amountA / reserveA;  
    }

    function firstAddLiquidity(uint256 amountA, uint256 amountB) notAlreadyInitialized public {
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);
        reserveA = amountA;
        reserveB = amountB;
        totalLPTokens = reserveA * reserveB * DECIMAL_FACTOR;
        lpTokens[msg.sender] = totalLPTokens;
        emit AddedLiquidity(address(tokenA), address(tokenB), amountA, amountB);
    }

    function getLiquidityOfProvider(address provider) public view returns (uint256) {
        return lpTokens[provider];
    }

    function getMyLiquidity() public view returns (uint256) {
        return lpTokens[msg.sender];
    }

    function getAmountBNecesary(uint256 amountA) public view returns (uint256) {
        return (amountA * reserveB) / reserveA;
    }

    function addLiquidity(uint256 amountA) public {
        uint256 amountB = getAmountBNecesary(amountA);
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);
        uint256 liquidityTokens = computeLiquidityTokens(amountA);
        reserveA += amountA;
        reserveB += amountB;
        lpTokens[msg.sender] += liquidityTokens;
        totalLPTokens += liquidityTokens;
        emit AddedLiquidity(address(tokenA), address(tokenB), amountA, amountB);
    }

    function getLiquidityEquivalent(uint liquidityTokens) view public returns (uint, uint) {
        return (liquidityTokens * reserveA / totalLPTokens, liquidityTokens * reserveB / totalLPTokens);
    }

    function getMyLiquidityEquivalent() view public returns (uint, uint) {
        return getLiquidityEquivalent(lpTokens[msg.sender]);
    }

    function removeLiquidity(uint256 liquidityTokens) 
        enoughLiquidityInPool(liquidityTokens) 
        enoughLiquidityForUser(msg.sender, liquidityTokens) public {

        (uint amountA, uint amountB) = getLiquidityEquivalent(liquidityTokens);
        
        IERC20(tokenA).transfer(msg.sender, amountA);
        IERC20(tokenB).transfer(msg.sender, amountB);

        reserveA -= amountA;
        reserveB -= amountB;
        totalLPTokens -= liquidityTokens;
        lpTokens[msg.sender] -= liquidityTokens;

        emit RemovedLiquidity(address(tokenA), address(tokenB), amountA, amountB);
    }

    function getReturn(
        IERC20 fromToken,
        uint256 amountIn
    ) public view validTokenAddress(fromToken) returns (uint256) {
        if (fromToken == tokenA) {
            return (amountIn * reserveB) / (reserveA + amountIn);
        } else {
            return (amountIn * reserveA) / (reserveB + amountIn);
        }
    }

    function getOtherToken(IERC20 fromToken) public view validTokenAddress(fromToken) returns (IERC20) {
        return fromToken == tokenA ? tokenB : tokenA;
    }

    function swap(address exchangerAddress, IERC20 fromToken, uint256 amountIn) 
        validSwapAmount(fromToken, amountIn) public returns (uint256){
        uint256 amountOut = getReturn(fromToken, amountIn);

        if(exchangerAddress == address(0))
            exchangerAddress = msg.sender;

        if (fromToken == tokenA) {
            IERC20(tokenA).transferFrom(exchangerAddress, address(this), amountIn);
            IERC20(tokenB).transfer(exchangerAddress, amountOut);
            reserveA += amountIn;
            reserveB -= amountOut;
            emit Swapped(address(tokenA), address(tokenB), amountIn, amountOut);
            return amountOut;
        } else {
            IERC20(tokenB).transferFrom(exchangerAddress, address(this), amountIn);
            IERC20(tokenA).transfer(exchangerAddress, amountOut);
            reserveB += amountIn;
            reserveA -= amountOut;
            emit Swapped(address(tokenB), address(tokenA), amountIn, amountOut);
            return amountOut;
        }
    }

    function getPrice() public view returns (uint256) {
        return (reserveB * DECIMAL_FACTOR) / reserveA;
    }
}
