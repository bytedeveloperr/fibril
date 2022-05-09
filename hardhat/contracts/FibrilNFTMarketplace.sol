// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "./FibrilNFT.sol";

contract FibrilNFTMarketplace is Initializable {
    bytes4 private constant ERC721_INTERFACE_ID = 0x80ac58cd;
    bytes4 private constant ERC1155_INTERFACE_ID = 0xd9b67a26;
    
    mapping(address => mapping(uint256 => mapping(address => Listing))) private _listings;
    FibrilNFT private _NFTContract;

    Counters.Counter private _itemCount;

    struct Listing {
        address nftAddress;
        address paymentToken;
        uint256 pricePerItem;
        uint256 quantity;
    }

    using Counters for Counters.Counter;

    function initialize() public initializer {
        _NFTContract = new FibrilNFT();
    }

    function mintToken(address _to, string memory _tokenURI) public {
        _NFTContract.safeMint(_to, _tokenURI);
    }

    function getNFTContractAddress() public view returns (address) {
        return address(_NFTContract);
    }

    function getListing(address _nftContract, address _owner, uint256 _tokenId) public view returns (Listing memory) {
        return _listings[_nftContract][_tokenId][_owner];
    }

    function listNFTItem(
        address _nftAddress,
        uint256 _tokenId,
        address _paymentToken,
        uint256 _pricePerItem,
        uint256 _quantity
    ) public {
        require(_paymentToken != address(0), "Payment Token address cannot be a zero address");
        require(_pricePerItem > 0, "Price cannot be zero or less than zero");

        _ensurevalidNft(_nftAddress, _tokenId, msg.sender, _quantity);
        _listings[_nftAddress][_tokenId][msg.sender] = Listing(_nftAddress, _paymentToken, _pricePerItem, _quantity);
    }

    function cancelListing(address _nftAddress, uint256 _tokenId) public {
        Listing memory _listing = _listings[_nftAddress][_tokenId][msg.sender];

        _ensurevalidNft(_nftAddress, _tokenId, msg.sender, _listing.quantity);

        delete _listings[_nftAddress][_tokenId][msg.sender];
    }

    function updateListing(address _nftAddress, uint256 _tokenId, address _payToken, uint256 _newPrice) public {
        Listing storage _listing = _listings[_nftAddress][_tokenId][msg.sender];

        _ensurevalidNft(_nftAddress, _tokenId, msg.sender, _listing.quantity);

        _listing.paymentToken = _payToken;
        _listing.pricePerItem = _newPrice;
    }

    function transferItem(address _nftAddress, uint256 _tokenId, address _owner, address _recipient, uint256 _quantity) public {
        _ensurevalidNft(_nftAddress, _tokenId, _owner, _quantity);
        _transferItem(_nftAddress, _tokenId, _owner, _recipient, _quantity);
    }

    function _transferItem(address _nftAddress, uint256 _tokenId, address _owner, address _recipient, uint256 _quantity) internal {
        if (IERC165(_nftAddress).supportsInterface(ERC721_INTERFACE_ID)) {
            IERC721(_nftAddress).safeTransferFrom(_owner, _recipient, _tokenId);
        } else if(IERC165(_nftAddress).supportsInterface(ERC1155_INTERFACE_ID)) {
            IERC1155(_nftAddress).safeTransferFrom(_owner, _recipient, _tokenId, _quantity, bytes(""));
        } else {
            revert("Invalid NFT address");
        }
    }

    function _ensurevalidNft(address _nftAddress, uint256 _tokenId, address _owner, uint256 _quantity) internal view {
        if(IERC165(_nftAddress).supportsInterface(ERC721_INTERFACE_ID)) {
            IERC721 nft = IERC721(_nftAddress);
            require(nft.ownerOf(_tokenId) == _owner, "Not owning Item");
            require(nft.isApprovedForAll(_owner, address(this)), "Item not approved");
        } else if(IERC165(_nftAddress).supportsInterface(ERC1155_INTERFACE_ID)) {
            IERC1155 nft = IERC1155(_nftAddress);
            require(nft.balanceOf(_owner, _tokenId) >= _quantity, "Not owning enough NFT");
            require(nft.isApprovedForAll(_owner, address(this)), "Item not approved");
        } else {
            revert("Invalid NFT address");
        }
    }
}
