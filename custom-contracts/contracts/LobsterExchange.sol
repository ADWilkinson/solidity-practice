// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LobsterExchange {
    struct Listing {
        address seller;
        uint256 quantity;
        uint256 buyPrice;
        uint256 endTime;
    }

    address public lobsterTokenAddress;
    mapping(uint256 => Listing) public listings;
    uint256 public listingId;

    constructor(address _lobsterTokenAddress) {
        lobsterTokenAddress = _lobsterTokenAddress;
    }

    function createListing(uint256 _quantity, uint256 _buyPrice) external {
        require(_quantity > 0, "Quantity must be greater than zero");
        require(_buyPrice > 0, "Buy price must be greater than zero");

        listings[listingId] = Listing({
            seller: msg.sender,
            quantity: _quantity,
            buyPrice: _buyPrice,
            endTime: block.timestamp + 1 days
        });

        IERC20(lobsterTokenAddress).transferFrom(
            msg.sender,
            address(this),
            _quantity
        );
        listingId++;
    }

    function buyListing(uint256 _listingId) external payable {
        Listing storage listing = listings[_listingId];
        require(listing.endTime > block.timestamp, "Listing has ended");
        require(
            msg.value >= listing.buyPrice,
            "Insufficient funds to buy listing"
        );

        IERC20 lobsterToken = IERC20(lobsterTokenAddress);
        lobsterToken.transferFrom(listing.seller, msg.sender, listing.quantity);
        payable(listing.seller).transfer(msg.value);
    }

    function cancelListing(uint256 _listingId) external {
        Listing storage listing = listings[_listingId];
        require(msg.sender == listing.seller, "Not the seller");
        require(listing.endTime > block.timestamp, "Listing has ended");

        IERC20 lobsterToken = IERC20(lobsterTokenAddress);
        lobsterToken.transfer(listing.seller, listing.quantity);
        delete listings[_listingId];
    }
}
