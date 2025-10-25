// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract VerificationSBT is ERC721, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    uint256 private _tokenIdCounter;
    
    struct SBTMetadata {
        uint8 source;
        bytes32 uniqueId;
        uint256 timestamp;
    }
    
    mapping(uint256 => SBTMetadata) public metadata;
    
    error TransferNotAllowed();
    
    event SBTMinted(address indexed to, uint256 indexed tokenId, uint8 source, uint256 timestamp);
    
    constructor(address minter) ERC721("VerificationSBT", "vSBT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, minter);
    }

    function mint(address to, uint8 source, bytes32 uniqueId) external onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        
        metadata[tokenId] = SBTMetadata({
            source: source,
            uniqueId: uniqueId,
            timestamp: block.timestamp
        });
        
        _safeMint(to, tokenId);
        emit SBTMinted(to, tokenId, source, block.timestamp);
        
        return tokenId;
    }
    
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        SBTMetadata memory data = metadata[tokenId];
        return string(abi.encodePacked(
            "http://127.0.0.1:3000/sbt/",
            Strings.toString(data.source),
            "/",
            Strings.toString(tokenId)
        ));
    }
    
    function getMetadata(uint256 tokenId) external view returns (SBTMetadata memory) {
        _requireOwned(tokenId);
        return metadata[tokenId];
    }
    
    // sbt block 
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert TransferNotAllowed();
        }
        return super._update(to, tokenId, auth);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
}