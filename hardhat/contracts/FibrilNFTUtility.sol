// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "./FibrilNFT.sol";

contract FibrilNFTUtility is Initializable {
    FibrilNFT private _NFTContract;
    Counters.Counter private _listingId;

    bytes4 private constant ERC721_INTERFACE_ID = 0x80ac58cd;
    address public constant NULL_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    mapping(address => mapping(uint256 => mapping(address => Listing))) private _listings;

    struct Listing {
        address nftAddress;
        address paymentToken;
        address listedBy;
        uint256 tokenId;
        uint256 listingId;
        uint256 pricePerItem;
        uint256 listedAt;
    }

    event Listed(
        address indexed nftAddress,
        address indexed paymentToken,
        address indexed listedBy,
        uint256 tokenId,
        uint256 listingId,
        uint256 pricePerItem,
        uint256 listedAt
    );
    event ListingClosed(uint256 listingId);

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

    function getListing(
        address _nftContract,
        address _owner,
        uint256 _tokenId
    ) public view returns (Listing memory) {
        return _listings[_nftContract][_tokenId][_owner];
    }

    function listNFTItem(
        address _nftAddress,
        uint256 _tokenId,
        address _paymentToken,
        address _listedBy,
        uint256 _pricePerItem
    ) public {
        require(_paymentToken != address(0), "Payment Token address cannot be a zero address");
        require(_pricePerItem > 0, "Price cannot be zero or less than zero");

        _ensurevalidNft(_nftAddress, _tokenId, msg.sender);

        Listing memory _listing = _listings[_nftAddress][_tokenId][_listedBy];
        require(_listing.nftAddress == address(0), "Item already listed");

        _listingId.increment();
        _listings[_nftAddress][_tokenId][_listedBy] = Listing(
            _nftAddress,
            _paymentToken,
            _listedBy,
            _tokenId,
            _listingId.current(),
            _pricePerItem,
            block.timestamp
        );

        emit Listed(
            _nftAddress,
            _paymentToken,
            _listedBy,
            _tokenId,
            _listingId.current(),
            _pricePerItem,
            block.timestamp
        );
    }

    function closeListing(
        address _nftAddress,
        uint256 _tokenId,
        address _listedBy
    ) public {
        _closeListing(_nftAddress, _tokenId, _listedBy);
    }

    function updateListing(
        address _nftAddress,
        uint256 _tokenId,
        address _payToken,
        uint256 _newPrice
    ) public {
        Listing storage _listing = _listings[_nftAddress][_tokenId][msg.sender];

        _ensurevalidNft(_nftAddress, _tokenId, msg.sender);

        _listing.paymentToken = _payToken;
        _listing.pricePerItem = _newPrice;
    }

    function transferItem(
        address _nftAddress,
        uint256 _tokenId,
        address _owner,
        address _recipient,
        uint256
    ) public {
        _ensurevalidNft(_nftAddress, _tokenId, _owner);
        _transferItem(_nftAddress, _tokenId, _owner, _recipient);
    }

    function buyItem(
        address _nftAddress,
        uint256 _tokenId,
        address _lister,
        address _buyFor,
        address _paymentToken,
        uint256 _amount
    ) public payable {
        Listing memory _listing = _listings[_nftAddress][_tokenId][_lister];

        require(_listing.listedBy != _buyFor, "Seller cannot also be buyer");
        require(_listing.paymentToken == _paymentToken, "Invalid payment token");

        if (_listing.paymentToken == NULL_ADDRESS) {
            require(_listing.pricePerItem == msg.value, "Amount is not valid");
            payable(_lister).transfer(msg.value);
        } else {
            require(_listing.pricePerItem == _amount, "Amount is not valid");
            IERC20(_listing.paymentToken).transferFrom(msg.sender, _lister, _amount);
        }

        address _owner = IERC721(_listing.nftAddress).ownerOf(_listing.tokenId);
        _closeListing(_listing.nftAddress, _listing.tokenId, _listing.listedBy);
        _transferItem(_listing.nftAddress, _listing.tokenId, _owner, _buyFor);
    }

    function _transferItem(
        address _nftAddress,
        uint256 _tokenId,
        address _owner,
        address _recipient
    ) internal {
        if (IERC165(_nftAddress).supportsInterface(ERC721_INTERFACE_ID)) {
            IERC721(_nftAddress).safeTransferFrom(_owner, _recipient, _tokenId);
        } else {
            revert("Invalid NFT address");
        }
    }

    function _ensurevalidNft(
        address _nftAddress,
        uint256 _tokenId,
        address _owner
    ) internal view {
        if (IERC165(_nftAddress).supportsInterface(ERC721_INTERFACE_ID)) {
            IERC721 nft = IERC721(_nftAddress);
            require(nft.ownerOf(_tokenId) == _owner, "Not owning Item");
            require(nft.isApprovedForAll(_owner, address(this)), "Item not approved");
        } else {
            revert("Invalid NFT address");
        }
    }

    function _closeListing(
        address _nftAddress,
        uint256 _tokenId,
        address _listedBy
    ) internal {
        Listing memory _listing = _listings[_nftAddress][_tokenId][_listedBy];

        _ensurevalidNft(_nftAddress, _tokenId, msg.sender);

        delete _listings[_nftAddress][_tokenId][_listedBy];
        emit ListingClosed(_listing.listingId);
    }
}
