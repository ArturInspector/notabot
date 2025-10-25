// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IVerificationAdapter.sol";
import "../core/MainAggregator.sol";
import "./helpers/ByteHasher.sol";
import "./interfaces/IWorldID.sol";

contract WorldcoinAdapter is IVerificationAdapter {
    using ByteHasher for bytes;
    
    IWorldID public immutable worldId;
    MainAggregator public immutable mainAggregator;
    
    uint256 internal immutable externalNullifierHash;
    uint256 internal immutable groupId = 1;
    
    mapping(uint256 => bool) public usedNullifiers;
    
    error DuplicateNullifier();
    error InvalidProof();
    
    event WorldcoinVerified(address indexed user, uint256 nullifierHash);
    
    constructor(
        address _worldId,
        address _mainAggregator,
        string memory _appId,
        string memory _action
    ) {
        worldId = IWorldID(_worldId);
        mainAggregator = MainAggregator(_mainAggregator);
        
        externalNullifierHash = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), _action)
            .hashToField();
    }
    
    function verifyAndRegister(address user, bytes calldata proof) external {
        (uint256 root, uint256 nullifierHash, uint256[8] memory zkProof) = 
            abi.decode(proof, (uint256, uint256, uint256[8]));
        
        if (usedNullifiers[nullifierHash]) revert DuplicateNullifier();
        
        worldId.verifyProof(
            root,
            groupId,
            abi.encodePacked(user).hashToField(),
            nullifierHash,
            externalNullifierHash,
            zkProof
        );
        
        usedNullifiers[nullifierHash] = true;
        
        mainAggregator.registerVerification(
            user,
            0, // sourceId in mainaggr
            bytes32(nullifierHash),
            proof
        );
        
        emit WorldcoinVerified(user, nullifierHash);
    }
    
    function getSourceId() external pure returns (uint8) {
        return 0;
    }
}

