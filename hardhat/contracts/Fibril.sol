// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./FibrilNFTMarketplace.sol";

contract Fibril is Initializable, IERC721Receiver {
    address public constant NULL_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    mapping(address => mapping(address => uint256)) private _balances;
    mapping(address => mapping(address => mapping(uint256 => Nft))) private _nfts;
    mapping(address => uint256) private _creators;

    Counters.Counter private _creatorCount;

    struct Nft {
        address nftAddress;
        address supporter;
        uint256 tokenId;
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
    event Creator(uint256 indexed id, address indexed account);

    using Counters for Counters.Counter;

    function initialize() public initializer {}

    function _addCreator(address _creator) internal {
        require(_creators[_creator] == 0, "Fibril: Creator already exist");

        _creatorCount.increment();
        _creators[_creator] = _creatorCount.current();
        emit Creator(_creatorCount.current(), _creator);
    }

    function _getCreatorId(address _creator) internal view returns (uint256) {
        return _creators[_creator];
    }

    function support(
        address _creator,
        address _token,
        uint256 _amount
    ) public {
        require(
            _creator != address(0),
            "Fibril: Creator cannot be the zero address"
        );
        require(
            _token != address(0),
            "Fibril: Token address cannot be the zero address"
        );
        require(_amount >= 0, "Fibril: Amount cannot be zero or less");

        if (_creators[_creator] == 0) {
            _addCreator(_creator);
        }

        IERC20 token = IERC20(_token);

        require(
            token.balanceOf(msg.sender) >= _amount,
            "Fibril: Insufficient balance"
        );
        require(
            token.allowance(msg.sender, address(this)) >= _amount,
            "Fibril: Allowance is not enough"
        );

        token.transferFrom(msg.sender, address(this), _amount);
        _incrementCreatorBalance(_creator, _token, _amount);

        emit Support(_creator, msg.sender, _token, "ERC20", 0, _amount);
    }

    function supportWithETH(address _creator) public payable {
        require(
            _creator != address(0),
            "Fibril: Creator cannot be the zero address"
        );
        require(msg.value >= 0, "Fibril: Amount cannot be zero or less");

        if (_creators[_creator] == 0) {
            _addCreator(_creator);
        }

        _incrementCreatorBalance(_creator, NULL_ADDRESS, msg.value);
        emit Support(_creator, msg.sender, NULL_ADDRESS, "ERC20", 0, msg.value);
    }

    function supportWithNFT(
        address _creator,
        address _nftAddress,
        uint256 _tokenId
    ) public payable {
        require(
            _creator != address(0),
            "Fibril: Creator cannot be the zero address"
        );

        if (_creators[_creator] == 0) {
            _addCreator(_creator);
        }

        _nfts[_creator][_nftAddress][_tokenId] = Nft(
            _nftAddress,
            msg.sender,
            _tokenId
        );
        IERC721(_nftAddress).safeTransferFrom(
            msg.sender,
            address(this),
            _tokenId
        );

        emit Support(_creator, msg.sender, _nftAddress, "ERC721", _tokenId, 1);
    }

    function withdrawNFT(
        address _recipient,
        address _nftAddress,
        uint256 _tokenId
    ) public payable {
        require(_creators[msg.sender] != 0, "Fibril: Creator does not exist");
        require(
            _recipient != address(0),
            "Fibril: Recipient address cannot be the zero address"
        );
        require(
            _nfts[msg.sender][_nftAddress][_tokenId].nftAddress != address(0),
            "Fibril: NFT not available"
        );

        delete _nfts[msg.sender][_nftAddress][_tokenId];
        IERC721(_nftAddress).safeTransferFrom(
            address(this),
            _recipient,
            _tokenId
        );

        emit Withdraw(msg.sender, _recipient, _nftAddress, "ERC721", _tokenId, 1);
    }

    function withdraw(
        address _token,
        address _recipient,
        uint256 _amount
    ) public {
        require(_creators[msg.sender] != 0, "Fibril: Creator does not exist");
        require(
            _token != address(0),
            "Fibril: Token address cannot be the zero address"
        );
        require(
            _recipient != address(0),
            "Fibril: Recipient address cannot be the zero address"
        );
        require(_amount >= 0, "Fibril: Amount cannot be zero or less");

        _decrementCreatorBalance(msg.sender, _token, _amount);

        if (_token == NULL_ADDRESS) {
            require(
                address(this).balance >= _amount,
                "Fibril: Contract token balance not enough"
            );
            payable(_recipient).transfer(_amount);
        } else {
            IERC20 token = IERC20(_token);
            require(
                token.balanceOf(address(this)) >= _amount,
                "Fibril: Contract token balance not enough"
            );
            token.transfer(_recipient, _amount);
        }

        emit Withdraw(msg.sender, _recipient, _token, "ERC20", 0, _amount);
    }

    function getBalance(address _creator, address _token)
        public
        view
        returns (uint256)
    {
        return _balances[_creator][_token];
    }

    function getCreatorCount() public view returns (uint256) {
        return _creatorCount.current();
    }

    function getCreatorId(address _creator) public view returns (uint256) {
        return _creators[_creator];
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
        require(
            _amount <= _balances[_creator][_token],
            "Fibril: Insufficient balance"
        );
        _balances[_creator][_token] -= _amount;
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
