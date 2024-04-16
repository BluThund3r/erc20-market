// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract LP {
    uint256 public constant DECIMAL_FACTOR = 1e9;

    IERC20 public tokenA;
    IERC20 public tokenB;
    uint256 public reserveA;
    uint256 public reserveB;

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

    modifier enoughLiquidity(uint256 amountA) {
        uint256 amountB = getAmountBNecesary(amountA);
        require(
            amountA <= reserveA && amountB <= reserveB,
            "Insufficient liquidity"
        );
        _;
    }

    constructor(IERC20 _tokenA, IERC20 _tokenB) {
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    function firstAddLiquidity(uint256 amountA, uint256 amountB) notAlreadyInitialized public {
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);
        reserveA += amountA;
        reserveB += amountB;
        emit AddedLiquidity(address(tokenA), address(tokenB), amountA, amountB);
    }

    function getAmountBNecesary(uint256 amountA) public view returns (uint256) {
        return (amountA * reserveB) / reserveA;
    }

    function addLiquidity(uint256 amountA) public {
        uint256 amountB = getAmountBNecesary(amountA);
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);
        reserveA += amountA;
        reserveB += amountB;
        emit AddedLiquidity(address(tokenA), address(tokenB), amountA, amountB);
    }

    function removeLiquidity(uint256 amountA) enoughLiquidity(amountA) public {
        uint256 amountB = getAmountBNecesary(amountA);

        IERC20(tokenA).transfer(msg.sender, amountA);
        IERC20(tokenB).transfer(msg.sender, amountB);
        reserveA -= amountA;
        reserveB -= amountB;
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

    function swap(IERC20 fromToken, uint256 amountIn) validSwapAmount(fromToken, amountIn) public {
        uint256 amountOut = getReturn(fromToken, amountIn);

        if (fromToken == tokenA) {
            IERC20(tokenA).transferFrom(msg.sender, address(this), amountIn);
            IERC20(tokenB).transfer(msg.sender, amountOut);
            reserveA += amountIn;
            reserveB -= amountOut;
            emit Swapped(address(tokenA), address(tokenB), amountIn, amountOut);
        } else {
            IERC20(tokenB).transferFrom(msg.sender, address(this), amountIn);
            IERC20(tokenA).transfer(msg.sender, amountOut);
            reserveB += amountIn;
            reserveA -= amountOut;
            emit Swapped(address(tokenB), address(tokenA), amountIn, amountOut);
        }
    }

    function getPrice() public view returns (uint256) {
        return (reserveB * DECIMAL_FACTOR) / reserveA;
    }
}
