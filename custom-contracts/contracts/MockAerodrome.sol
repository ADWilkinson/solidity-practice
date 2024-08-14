pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockAerodrome {
    uint256 public expectedOutput;

    function setExpectedOutput(uint256 _expectedOutput) external {
        expectedOutput = _expectedOutput;
    }

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        Route[] calldata routes,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts) {
        require(routes.length == 1, "Only single hop supported in mock");
        IERC20(routes[0].from).transferFrom(msg.sender, address(this), amountIn);
        IERC20(routes[0].to).transfer(to, expectedOutput);
        amounts = new uint[](2);
        amounts[0] = amountIn;
        amounts[1] = expectedOutput;
        return amounts;
    }

    struct Route {
        address from;
        address to;
        bool stable;
    }
}