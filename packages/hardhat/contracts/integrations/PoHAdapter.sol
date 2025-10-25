// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IVerificationAdapter.sol";
import "../core/MainAggregator.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title PoHAdapter
 * @notice Adapter for Proof of Humanity verification
 * @dev Uses oracle-based verification since PoH registry is on Ethereum mainnet
 * Oracle backend checks PoH registry and signs verification proof
 */
contract PoHAdapter is IVerificationAdapter {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    
    MainAggregator public immutable mainAggregator;
    address public immutable backendOracle;
    
    uint256 public constant PROOF_VALIDITY = 1 hours;
    
    mapping(bytes32 => bool) public usedProofs;
    
    error InvalidSignature();
    error ProofExpired();
    error ProofAlreadyUsed();
    error NotRegisteredInPoH();
    
    event PoHVerified(address indexed user, bytes32 pohId);
    
    /**
     * @param _mainAggregator Address of MainAggregator contract
     * @param _backendOracle Address of trusted backend oracle
     */
    constructor(address _mainAggregator, address _backendOracle) {
        mainAggregator = MainAggregator(_mainAggregator);
        backendOracle = _backendOracle;
    }
    
    /**
     * @notice Verify Proof of Humanity status and register user
     * @param user Address to verify
     * @param proof Encoded proof: (bytes32 pohId, uint256 timestamp, bytes signature)
     * @dev Proof format: abi.encode(pohId, timestamp, signature)
     * Backend oracle checks PoH registry and signs: keccak256(user, pohId, timestamp)
     */
    function verifyAndRegister(address user, bytes calldata proof) external {
        // CEI Pattern: Checks
        (bytes32 pohId, uint256 timestamp, bytes memory signature) = 
            abi.decode(proof, (bytes32, uint256, bytes));
        
        if (block.timestamp > timestamp + PROOF_VALIDITY) revert ProofExpired();
        if (usedProofs[pohId]) revert ProofAlreadyUsed();
        
        bytes32 message = keccak256(abi.encodePacked(user, pohId, timestamp));
        bytes32 ethSignedHash = message.toEthSignedMessageHash();
        
        if (ethSignedHash.recover(signature) != backendOracle) revert InvalidSignature();
    
        usedProofs[pohId] = true;
        
        mainAggregator.registerVerification(user, 2, pohId, proof);
        
        emit PoHVerified(user, pohId);
    }
    
    function getSourceId() external pure returns (uint8) {
        return 2;
    }
}

