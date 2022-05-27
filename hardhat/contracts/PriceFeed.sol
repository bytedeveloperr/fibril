// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract PriceFeed {
    mapping(address => AggregatorV3Interface) private _aggregators;

    function addPriceFeedAggregator(address _token, address _aggregator) public {
        require(_token != address(0), "Token cannot be the zero address");
        require(address(_aggregators[_aggregator]) == address(0), "Aggregator already exist");

        _aggregators[_token] = AggregatorV3Interface(_aggregator);
    }

    function getLatestPrice(address _token) public view returns (int value, uint8 decimals) {
        require(_token != address(0), "Token cannot be the zero address");

        AggregatorV3Interface _aggregator = _aggregators[_token];
        require(address(_aggregator) != address(0), "Aggregator does not exist");

        (, int _price, , , ) = _aggregator.latestRoundData();
        return (_price, _aggregator.decimals());
    }
}
