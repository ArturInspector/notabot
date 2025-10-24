// SPDX-License-Identifier: MIT
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
    
}