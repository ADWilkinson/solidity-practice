// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LobsterToken is ERC20 {
    mapping(address => uint256) private _lastFishTime;

    uint256 private constant _fishCooldown = 1 minutes;

    constructor() ERC20("Lobster", "LOB") {}

    function fish() public {
        require(
            _lastFishTime[msg.sender] + _fishCooldown <= block.timestamp,
            "Fish: Cooldown period has not passed"
        );

        _lastFishTime[msg.sender] = block.timestamp;

        _mint(msg.sender, 1 * 10 ** decimals());
    }
}