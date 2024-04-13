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

    constructor(IERC20 _tokenA, IERC20 _tokenB) {
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    function addLiquidity(uint256 amountA, uint256 amountB) public {
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);
        reserveA += amountA;
        reserveB += amountB;
    }

    function removeLiquidity(uint256 amountA, uint256 amountB) public {
        require(
            amountA <= reserveA && amountB <= reserveB,
            "Insufficient liquidity"
        );
        IERC20(tokenA).transfer(msg.sender, amountA);
        IERC20(tokenB).transfer(msg.sender, amountB);
        reserveA -= amountA;
        reserveB -= amountB;
    }

    function getReturn(
        IERC20 fromToken,
        uint256 amountIn
    ) public view returns (uint256) {
        require(
            (fromToken == tokenA || fromToken == tokenB),
            "Invalid token address"
        );
        if (fromToken == tokenA) {
            return (amountIn * reserveB) / (reserveA + amountIn);
        } else {
            return (amountIn * reserveA) / (reserveB + amountIn);
        }
    }

    function swap(IERC20 fromToken, uint256 amountIn) public {
        uint256 amountOut = getReturn(fromToken, amountIn);
        require(amountOut > 0, "Invalid swap amount");

        if (fromToken == tokenA) {            
            IERC20(tokenA).transferFrom(msg.sender, address(this), amountIn);
            IERC20(tokenB).transfer(msg.sender, amountOut);
            reserveA += amountIn;
            reserveB -= amountOut;
        } else {
            IERC20(tokenB).transferFrom(msg.sender, address(this), amountIn);
            IERC20(tokenA).transfer(msg.sender, amountOut);
            reserveB += amountIn;
            reserveA -= amountOut;
        }
    }

    function getPrice() public view returns (uint256) {
        return (reserveB * DECIMAL_FACTOR) / reserveA;
    }
}
