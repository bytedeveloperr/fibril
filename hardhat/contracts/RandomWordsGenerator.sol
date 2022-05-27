// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Fibril.sol";

contract RandomWordsGenerator is Ownable, VRFConsumerBaseV2 {
    uint64 subscriptionId;
    bytes32 keyHash;
    VRFCoordinatorV2Interface vrfCoordinator;
    uint32 callbackGasLimit = 500000;
    uint16 requestConfirmations = 3;
    Fibril _fibril;

    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
    }

    function setFibrilAddress(address _fibrilAddress) public onlyOwner {
        _fibril = Fibril(_fibrilAddress);
    }

    function requestRandomWords(uint32 _numWords) public returns (uint256) {
        require(msg.sender == address(_fibril), "Invalid fibril address");

        return
            vrfCoordinator.requestRandomWords(
                keyHash,
                subscriptionId,
                requestConfirmations,
                callbackGasLimit,
                _numWords
            );
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal virtual override {
        _fibril.handleFulfilRandomWords(requestId, randomWords);
    }
}
