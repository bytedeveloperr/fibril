// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./FibrilNFTUtility.sol";
import "./RandomWordsGenerator.sol";

contract Fibril is Initializable, IERC721Receiver {
    address public constant NULL_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    mapping(address => Creator) private _creators;
    mapping(address => mapping(uint256 => address)) private _supporterAddress;
    mapping(address => mapping(address => uint256)) private _supporterId;
    mapping(address => mapping(address => bool)) private _isSupporter;
    mapping(address => mapping(address => uint256)) private _balances;
    mapping(address => mapping(address => mapping(uint256 => Nft))) private _nfts;
    mapping(address => mapping(address => mapping(address => uint256))) private _supports;
    mapping(uint256 => Reward) private _rewards;

    Counters.Counter private _creatorCount;
    FibrilNFTUtility private _nftUtility;
    RandomWordsGenerator private _randomWordsGenerator;

    struct Nft {
        address nftAddress;
        address supporter;
        uint256 tokenId;
    }
    struct Creator {
        address addr;
        uint256 id;
        uint256 supportersCount;
    }
    struct Reward {
        address creator;
        address token;
        address[] winners;
        uint32 winnersCount;
        uint256 requestId;
        uint256 amountPerWinner;
        uint256 timestamp;
        string status;
    }

    event Support(
        address indexed creator,
        address indexed supporter,
        address indexed token,
        string tokenType,
        uint256 tokenId,
        uint256 amount
    );
    event Withdraw(
        address indexed creator,
        address indexed recipient,
        address indexed token,
        string tokenType,
        uint256 tokenId,
        uint256 amount
    );
    event RewardCreated(
        address indexed creator,
        address indexed token,
        uint32 winnersCount,
        uint256 requestId,
        uint256 amountPerWinner
    );

    event NftSold(address indexed creator, address indexed buyer, address indexed nftAddress, uint256 tokenId);
    event CreatorCreated(uint256 indexed id, address indexed account);
    event RewardUpdated(uint256 requestId, address[] winners, string status);

    using Counters for Counters.Counter;

    function initialize(address _nftUtilityAddress, address _randomWordsGeneratorAddress) public initializer {
        _nftUtility = FibrilNFTUtility(_nftUtilityAddress);
        _randomWordsGenerator = RandomWordsGenerator(_randomWordsGeneratorAddress);
    }

    function _addCreator(address _creator) internal {
        require(_creators[_creator].addr == address(0), "Fibril: Creator already exist");

        _creatorCount.increment();
        _creators[_creator] = Creator(msg.sender, _creatorCount.current(), 0);
        emit CreatorCreated(_creatorCount.current(), _creator);
    }

    function support(
        address _creator,
        address _token,
        uint256 _amount
    ) public {
        require(_creator != address(0), "Fibril: Creator cannot be the zero address");
        require(_token != address(0), "Fibril: Token address cannot be the zero address");
        require(_amount >= 0, "Fibril: Amount cannot be zero or less");

        if (_creators[_creator].addr == address(0)) {
            _addCreator(_creator);
        }

        IERC20 token = IERC20(_token);

        require(token.balanceOf(msg.sender) >= _amount, "Fibril: Insufficient balance");
        require(token.allowance(msg.sender, address(this)) >= _amount, "Fibril: Allowance is not enough");

        token.transferFrom(msg.sender, address(this), _amount);
        _incrementCreatorBalance(_creator, _token, _amount);
        _updateSupporter(_creator, msg.sender, _token, _amount);

        emit Support(_creator, msg.sender, _token, "ERC20", 0, _amount);
    }

    function supportWithETH(address _creator) public payable {
        require(_creator != address(0), "Fibril: Creator cannot be the zero address");
        require(msg.value >= 0, "Fibril: Amount cannot be zero or less");

        if (_creators[_creator].addr == address(0)) {
            _addCreator(_creator);
        }

        _incrementCreatorBalance(_creator, NULL_ADDRESS, msg.value);
        _updateSupporter(_creator, msg.sender, NULL_ADDRESS, msg.value);

        emit Support(_creator, msg.sender, NULL_ADDRESS, "ERC20", 0, msg.value);
    }

    function supportWithNFT(
        address _creator,
        address _nftAddress,
        uint256 _tokenId
    ) public payable {
        require(_creator != address(0), "Fibril: Creator address cannot be the zero address");
        require(_creator != address(0), "Fibril: NFT address cannot be the zero address");

        if (_creators[_creator].addr == address(0)) {
            _addCreator(_creator);
        }

        _nfts[_creator][_nftAddress][_tokenId] = Nft(_nftAddress, msg.sender, _tokenId);
        IERC721(_nftAddress).safeTransferFrom(msg.sender, address(this), _tokenId);

        emit Support(_creator, msg.sender, _nftAddress, "ERC721", _tokenId, 1);
    }

    function withdrawNFT(
        address _recipient,
        address _nftAddress,
        uint256 _tokenId
    ) public payable {
        require(_creators[msg.sender].addr != address(0), "Fibril: Creator does not exist");
        require(_recipient != address(0), "Fibril: Recipient address cannot be the zero address");
        require(_nfts[msg.sender][_nftAddress][_tokenId].nftAddress != address(0), "Fibril: NFT not available");

        delete _nfts[msg.sender][_nftAddress][_tokenId];
        IERC721(_nftAddress).safeTransferFrom(address(this), _recipient, _tokenId);

        emit Withdraw(msg.sender, _recipient, _nftAddress, "ERC721", _tokenId, 1);
    }

    function withdraw(
        address _token,
        address _recipient,
        uint256 _amount
    ) public {
        require(_creators[msg.sender].addr != address(0), "Fibril: Creator does not exist");
        require(_token != address(0), "Fibril: Token address cannot be the zero address");
        require(_recipient != address(0), "Fibril: Recipient address cannot be the zero address");
        require(_amount >= 0, "Fibril: Amount cannot be zero or less");

        _withdrawToken(_creators[msg.sender].addr, _token, _recipient, _amount);
    }

    function getCreatorBalance(address _creator, address _token) public view returns (uint256) {
        return _balances[_creator][_token];
    }

    function getSupporterContribution(
        address _creator,
        address _supporter,
        address _token
    ) public view returns (uint256) {
        return _supports[_creator][_supporter][_token];
    }

    function getCreatorCount() public view returns (uint256) {
        return _creatorCount.current();
    }

    function listNft(
        address _nftAddress,
        uint256 _tokenId,
        address _paymentToken,
        uint256 _pricePerItem
    ) public {
        require(_creators[msg.sender].addr != address(0), "Fibril: Creator does not exist");
        require(_nftAddress != address(0), "Fibril: NFT address cannot be the zero address");
        Nft memory _nft = _nfts[msg.sender][_nftAddress][_tokenId];
        require(_nft.nftAddress != address(0), "Invalid NFT Item");

        if (!IERC721(_nftAddress).isApprovedForAll(address(this), address(_nftUtility))) {
            IERC721(_nftAddress).setApprovalForAll(address(_nftUtility), true);
        }

        _nftUtility.listNFTItem(_nftAddress, _tokenId, _paymentToken, msg.sender, _pricePerItem);
    }

    function closeNftListing(address _nftAddress, uint256 _tokenId) public {
        require(_creators[msg.sender].addr != address(0), "Fibril: Creator does not exist");
        require(_nftAddress != address(0), "Fibril: NFT address cannot be the zero address");
        Nft memory _nft = _nfts[msg.sender][_nftAddress][_tokenId];
        require(_nft.nftAddress != address(0), "Invalid NFT Item");

        if (!IERC721(_nftAddress).isApprovedForAll(address(this), address(_nftUtility))) {
            IERC721(_nftAddress).setApprovalForAll(address(_nftUtility), true);
        }

        _nftUtility.closeListing(_nftAddress, _tokenId, msg.sender);
    }

    function buyItem(
        address _creator,
        address _nftAddress,
        uint256 _tokenId,
        address _paymentToken,
        uint256 _amount
    ) public payable {
        require(_creators[_creator].addr != address(0), "Fibril: Creator does not exist");

        Nft memory _nft = _nfts[_creator][_nftAddress][_tokenId];
        require(_nft.nftAddress != address(0), "Invalid NFT Item");

        if (_paymentToken == NULL_ADDRESS) {
            _nftUtility.buyItem{value: msg.value}(_nftAddress, _tokenId, _creator, msg.sender, _paymentToken, _amount);
        } else {
            IERC20 token = IERC20(_paymentToken);

            require(token.allowance(msg.sender, address(this)) >= _amount, "Fibril: Allowance is not enough");
            token.transferFrom(msg.sender, address(this), _amount);
            token.approve(address(_nftUtility), _amount);

            _nftUtility.buyItem(_nftAddress, _tokenId, _creator, msg.sender, _paymentToken, _amount);
        }

        emit NftSold(_creator, msg.sender, _nftAddress, _tokenId);
    }

    function rewardRandomSupporters(
        uint32 _winnersCount,
        address _token,
        uint256 _amountPerWinner
    ) public {
        require(_creators[msg.sender].addr != address(0), "Fibril: Creator does not exist");
        require(_token != address(0), "Fibril: Token address cannot be the zero address");
        require(_winnersCount >= 1, "Fibril: Possible winners must be 1 or more");
        require(
            _winnersCount <= _creators[msg.sender].supportersCount,
            "Fibril: Possible winners cannot be more than total supporters"
        );
        require(_amountPerWinner * _winnersCount <= _balances[msg.sender][_token], "Fibril: Insufficient balance");

        uint256 _requestId = _randomWordsGenerator.requestRandomWords(_winnersCount);
       
        _rewards[_requestId].creator = msg.sender;
        _rewards[_requestId].requestId = _requestId;
        _rewards[_requestId].token = _token;
        _rewards[_requestId].winnersCount = _winnersCount;
        _rewards[_requestId].amountPerWinner = _amountPerWinner;
        _rewards[_requestId].timestamp = block.timestamp;
        _rewards[_requestId].status = "Initiated";

        emit RewardCreated(msg.sender, _token, _winnersCount, _requestId, _amountPerWinner);
    }

    function handleFulfilRandomWords(uint256 _requestId, uint256[] memory _randomWords) public {
        Reward memory _reward = _rewards[_requestId];
        require(_reward.requestId != 0, "Fibril: Reward does not exist");

        address[] memory _winners = new address[](_reward.winnersCount);

        for (uint32 i = 0; i < _reward.winnersCount; i++) {
            uint _id = (_randomWords[i] % _creators[_reward.creator].supportersCount) + 1;
            address _winner = _supporterAddress[_reward.creator][_id];
            _winners[i] = _winner;

            _withdrawToken(_reward.creator, _reward.token, _winner, _reward.amountPerWinner);
        }

        _rewards[_requestId].status = "Completed";
        _rewards[_requestId].winners = _winners;
        
        emit RewardUpdated(_reward.requestId, _winners, "Completed");
    }

    function getCreator(address _address) public view returns (Creator memory) {
        return _creators[_address];
    }

    function _incrementCreatorBalance(
        address _creator,
        address _token,
        uint256 _amount
    ) internal {
        _balances[_creator][_token] += _amount;
    }

    function _decrementCreatorBalance(
        address _creator,
        address _token,
        uint256 _amount
    ) internal {
        require(_amount <= _balances[_creator][_token], "Fibril: Insufficient balance");
        _balances[_creator][_token] -= _amount;
    }

    function _updateSupporter(
        address _creator,
        address _supporter,
        address _token,
        uint256 _amount
    ) internal {
        if (!_isSupporter[_creator][_supporter]) {
            _isSupporter[_creator][_supporter] = true;
            _creators[_creator].supportersCount += 1;
            _supporterAddress[_creator][_creators[_creator].supportersCount] = _supporter;
            _supporterId[_creator][_supporter] = _creators[_creator].supportersCount;
        }

        _supports[_creator][_supporter][_token] += _amount;
    }

    function _withdrawToken(
        address _creator,
        address _token,
        address _recipient,
        uint256 _amount
    ) internal {
        _decrementCreatorBalance(_creator, _token, _amount);
        if (_token == NULL_ADDRESS) {
            require(address(this).balance >= _amount, "Fibril: Contract token balance not enough");
            payable(_recipient).transfer(_amount);
        } else {
            IERC20 token = IERC20(_token);
            require(token.balanceOf(address(this)) >= _amount, "Fibril: Contract token balance not enough");
            token.transfer(_recipient, _amount);
        }

        emit Withdraw(_creator, _recipient, _token, "ERC20", 0, _amount);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) public pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
