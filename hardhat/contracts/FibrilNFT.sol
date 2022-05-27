// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract FibrilNFT is ERC721, ERC721URIStorage, Ownable {
    Counters.Counter private _tokenIdCount;

    using Counters for Counters.Counter;

    constructor() ERC721("Fibril", "FBL") {}

    function safeMint(address _to, string memory _tokenURI) public onlyOwner returns (uint256) {
        _tokenIdCount.increment();

        _safeMint(_to, _tokenIdCount.current());
        _setTokenURI(_tokenIdCount.current(), _tokenURI);

        return _tokenIdCount.current();
    }

    function _burn(uint256 _tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(_tokenId);
    }

    function tokenURI(uint256 _tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(_tokenId);
    }

    function tokenIdCount() public view returns (uint256) {
        return _tokenIdCount.current();
    }
}
