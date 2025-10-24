pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

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
        return tokenId;
    }
    
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
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