// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract AevocadoTree is ERC20, ERC20Permit {
    using SafeERC20 for IERC20;

    address public AEVO_CONTRACT_ADDRESS;
    uint256 public EXCHANGE_RATIO;
    uint256 public MAX_SUPPLY;

    event AevoDeposited(
        address indexed user,
        uint256 aevoAmount,
        uint256 aevocadoAmount
    );
    event AevocadoConverted(
        address indexed user,
        uint256 aevocadoAmount,
        uint256 aevoAmount
    );

    constructor(
        address _aevoContractAddress,
        uint256 _exchangeRatio,
        uint256 _maxSupply
    ) ERC20("AevocadoTree", "AEVOCADO") ERC20Permit("AevocadoTree") {
        AEVO_CONTRACT_ADDRESS = _aevoContractAddress;
        EXCHANGE_RATIO = _exchangeRatio;
        MAX_SUPPLY = _maxSupply;
    }

    function depositAevoForAevocado(uint256 aevoAmount) external {
        require(aevoAmount > 0, "Amount must be greater than 0");
        require(
            aevoAmount % EXCHANGE_RATIO == 0,
            "Amount must be divisible by 100"
        );

        uint256 aevocadoAmount = aevoAmount / EXCHANGE_RATIO;
        require(
            totalSupply() + aevocadoAmount <= MAX_SUPPLY,
            "Exceeds max supply"
        );

        IERC20 aevoToken = IERC20(AEVO_CONTRACT_ADDRESS);
        aevoToken.safeTransferFrom(msg.sender, address(this), aevoAmount);

        _mint(msg.sender, aevocadoAmount);

        emit AevoDeposited(msg.sender, aevoAmount, aevocadoAmount);
    }

    function convertAevocadoToAevo(uint256 aevocadoAmount) external {
        require(aevocadoAmount > 0, "Amount must be greater than 0");

        uint256 aevoAmount = aevocadoAmount * EXCHANGE_RATIO;

        IERC20 aevoToken = IERC20(AEVO_CONTRACT_ADDRESS);
        require(
            aevoToken.balanceOf(address(this)) >= aevoAmount,
            "Insufficient AEVO balance in contract"
        );

        _burn(msg.sender, aevocadoAmount);
        aevoToken.safeTransfer(msg.sender, aevoAmount);

        emit AevocadoConverted(msg.sender, aevocadoAmount, aevoAmount);
    }
}
