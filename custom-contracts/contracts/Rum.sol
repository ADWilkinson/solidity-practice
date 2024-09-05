pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Rum is ERC20, Ownable {
    uint256 constant public RUM_RATIO = 1_000_000;
    uint256 constant public SELL_MAX = 1_000_000 * 10**18;

    constructor(string memory _name, string memory _symbol) 
    ERC20(_name, _symbol) 
    Ownable(msg.sender) {}

    function buyRum() public payable {
        require(msg.value > 0, "Must send ETH to buy Rum");
        uint256 rumAmount = msg.value * RUM_RATIO;
        _mint(msg.sender, rumAmount);
    }

    function sellRum(uint256 _quantity) public {
        require(_quantity > 0 && _quantity <= SELL_MAX, "Invalid quantity");
        require(balanceOf(msg.sender) >= _quantity, "Insufficient Rum balance");

        uint256 ethAmount = _quantity / RUM_RATIO;
        require(address(this).balance >= ethAmount, "Insufficient contract balance");

        _burn(msg.sender, _quantity);
        
        (bool sent, ) = payable(msg.sender).call{value: ethAmount}("");
        require(sent, "Failed to send Ether");
    }

    receive() external payable {
        buyRum();
    }
}