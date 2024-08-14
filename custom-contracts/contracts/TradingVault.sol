// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

interface IAerodrome {
    struct Route {
        address from;
        address to;
        bool stable;
    }

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        Route[] calldata routes,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

contract TradeVault is Ownable, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable USDC;
    IERC20 public immutable WETH;
    IAerodrome public immutable aerodrome;
    AggregatorV3Interface public immutable ethUsdPriceFeed;

    uint256 public constant SLIPPAGE_TOLERANCE = 50; // 0.5%

    event Deposit(uint256 amount);
    event Withdrawal(uint256 amount);
    event SwappedToWETH(uint256 usdcAmount, uint256 wethAmount);
    event SwappedToUSDC(uint256 wethAmount, uint256 usdcAmount);

    constructor(
        address _usdc,
        address _weth,
        address _aerodrome,
        address _ethUsdPriceFeed
    ) Ownable(msg.sender) Pausable() {
        require(_usdc != address(0), "Invalid USDC address");
        require(_weth != address(0), "Invalid WETH address");
        require(_aerodrome != address(0), "Invalid Aerodrome address");
        require(_ethUsdPriceFeed != address(0), "Invalid ETH/USD price feed address");

        USDC = IERC20(_usdc);
        WETH = IERC20(_weth);
        aerodrome = IAerodrome(_aerodrome);
        ethUsdPriceFeed = AggregatorV3Interface(_ethUsdPriceFeed);
    }

    function deposit(uint256 amount) external onlyOwner whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        USDC.safeTransferFrom(msg.sender, address(this), amount);
        emit Deposit(amount);
    }

    function withdrawAll() external onlyOwner {
        uint256 balance = USDC.balanceOf(address(this));
        require(balance > 0, "No USDC to withdraw");
        USDC.safeTransfer(msg.sender, balance);
        emit Withdrawal(balance);
    }

    function swapAllUSDCToWETH() external onlyOwner whenNotPaused {
        uint256 usdcAmount = USDC.balanceOf(address(this));
        require(usdcAmount > 0, "No USDC to swap");

        USDC.safeIncreaseAllowance(address(aerodrome), usdcAmount);

        IAerodrome.Route[] memory routes = new IAerodrome.Route[](1);
        routes[0] = IAerodrome.Route(address(USDC), address(WETH), false);

        uint256 minAmountOut = calculateMinWETHOut(usdcAmount);

        uint256[] memory amounts;
        
        try aerodrome.swapExactTokensForTokens(
            usdcAmount,
            minAmountOut,
            routes,
            address(this),
            block.timestamp + 15 minutes
        ) returns (uint256[] memory _amounts) {
            amounts = _amounts;
        } catch Error(string memory reason) {
            revert(string(abi.encodePacked("Aerodrome swap failed: ", reason)));
        } catch {
            revert("Aerodrome swap failed");
        }

        require(amounts.length > 0, "Swap returned no amounts");
        uint256 wethAmount = amounts[amounts.length - 1];
        require(wethAmount >= minAmountOut, "Slippage tolerance exceeded");

        emit SwappedToWETH(usdcAmount, wethAmount);
    }

    function swapAllWETHToUSDC() external onlyOwner whenNotPaused {
        uint256 wethAmount = WETH.balanceOf(address(this));
        require(wethAmount > 0, "No WETH to swap");

        WETH.safeIncreaseAllowance(address(aerodrome), wethAmount);
        
        IAerodrome.Route[] memory routes = new IAerodrome.Route[](1);
        routes[0] = IAerodrome.Route(address(WETH), address(USDC), false);

        uint256 minAmountOut = calculateMinUSDCOut(wethAmount);

        uint256[] memory amounts;
        
        try aerodrome.swapExactTokensForTokens(
            wethAmount,
            minAmountOut,
            routes,
            address(this),
            block.timestamp + 15 minutes
        ) returns (uint256[] memory _amounts) {
            amounts = _amounts;
        } catch Error(string memory reason) {
            revert(string(abi.encodePacked("Aerodrome swap failed: ", reason)));
        } catch {
            revert("Aerodrome swap failed");
        }

        require(amounts.length > 0, "Swap returned no amounts");
        uint256 usdcAmount = amounts[amounts.length - 1];
        require(usdcAmount >= minAmountOut, "Slippage tolerance exceeded");

        emit SwappedToUSDC(wethAmount, usdcAmount);
    }

    function calculateMinWETHOut(uint256 usdcAmount) public view returns (uint256) {
        (, int256 price, , , ) = ethUsdPriceFeed.latestRoundData();
        require(price > 0, "Invalid ETH/USD price");
        
        // Convert USDC amount to ETH
        // Note: USDC has 6 decimals, ETH has 18, and Chainlink price has 8 decimals
        uint256 expectedWethAmount = (usdcAmount * 1e20) / uint256(price);
        
        // Apply slippage tolerance
        return (expectedWethAmount * (10000 - SLIPPAGE_TOLERANCE)) / 10000;
    }

    function calculateMinUSDCOut(uint256 wethAmount) public view returns (uint256) {
        (, int256 price, , , ) = ethUsdPriceFeed.latestRoundData();
        require(price > 0, "Invalid ETH/USD price");
        
        // Convert ETH amount to USDC
        // Note: USDC has 6 decimals, ETH has 18, and Chainlink price has 8 decimals
        uint256 expectedUsdcAmount = (wethAmount * uint256(price)) / 1e20;
        
        // Apply slippage tolerance
        return (expectedUsdcAmount * (10000 - SLIPPAGE_TOLERANCE)) / 10000;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}