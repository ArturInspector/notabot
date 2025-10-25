// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IVerificationAdapter.sol";
import "../core/MainAggregator.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract GitcoinAdapter is IVerificationAdapter {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    
    MainAggregator public immutable mainAggregator;
    address public immutable backendOracle;
    
    uint256 public constant MIN_SCORE = 20;
    uint256 public constant PROOF_VALIDITY = 1 hours;
    
    mapping(bytes32 => bool) public usedProofs;
    
    error InvalidSignature();
    error ScoreTooLow();
    error ProofExpired();
    error ProofAlreadyUsed();
    
    event GitcoinVerified(address indexed user, uint256 score, bytes32 userId);
    
    constructor(address _mainAggregator, address _backendOracle) {
        mainAggregator = MainAggregator(_mainAggregator);
        backendOracle = _backendOracle;
    }
    
    function verifyAndRegister(address user, bytes calldata proof) external {
        (bytes32 userId, uint256 score, uint256 timestamp, bytes memory signature) = 
            abi.decode(proof, (bytes32, uint256, uint256, bytes));
        
        if (block.timestamp > timestamp + PROOF_VALIDITY) revert ProofExpired();
        if (score < MIN_SCORE) revert ScoreTooLow();
        if (usedProofs[userId]) revert ProofAlreadyUsed();
        
        bytes32 message = keccak256(abi.encodePacked(user, userId, score, timestamp));
        bytes32 ethSignedHash = message.toEthSignedMessageHash();
        
        if (ethSignedHash.recover(signature) != backendOracle) revert InvalidSignature();
        
        usedProofs[userId] = true;
        
        mainAggregator.registerVerification(user, 1, userId, proof);
        
        emit GitcoinVerified(user, score, userId);
    }
    
    function getSourceId() external pure returns (uint8) {
        return 1;
    }
}

