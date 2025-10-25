// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IHumanityOracle.sol";

contract MainAggregator is IHumanityOracle, Ownable, ReentrancyGuard, Pausable {
    
    IERC20 public immutable verificationToken;
    mapping(address => bool) public isAdapter;
    mapping(address => uint8) public adapterToSource;
    mapping(address => VerificationData[]) public userVerifications;
    mapping(bytes32 => bool) public usedUniqueIds;
    
    uint256 public constant TOKEN_REWARD = 1 * 1e18;
    
    struct VerificationData {
        uint8 source;
        uint256 timestamp;
        bytes32 uniqueId;
    }

    error UnauthorizedAdapter();
    error DuplicateVerification();
    error InvalidAddress();
    
    event VerificationRegistered(
        address indexed user,
        uint8 indexed source,
        bytes32 uniqueId,
        uint256 timestamp
    );
    event TokensRevoked(address indexed user, uint256 amount);
    event AdapterAdded(address indexed adapter, uint8 sourceId);
    event AdapterRemoved(address indexed adapter);
    
    constructor(address _tokenAddr) Ownable(msg.sender) {
        if (_tokenAddr == address(0)) {
            revert InvalidAddress();
        }
        
        verificationToken = IERC20(_tokenAddr);
    }
    // verification from authorized adapter
    // within CEI pattern
    function registerVerification(
        address user,
        uint8 source,
        bytes32 uniqueId,
        bytes calldata /* proof */
    ) external nonReentrant whenNotPaused {
        if (!isAdapter[msg.sender]) revert UnauthorizedAdapter();
        if (user == address(0)) revert InvalidAddress();
        if (usedUniqueIds[uniqueId]) revert DuplicateVerification();
        usedUniqueIds[uniqueId] = true;
        
        
        userVerifications[user].push(VerificationData({
            source: source,
            timestamp: block.timestamp,
            uniqueId: uniqueId
        }));

        require(
            verificationToken.transfer(user, TOKEN_REWARD),
            "Token transfer failed"
        );
        
        emit VerificationRegistered(
            user,
            source,
            uniqueId,
            block.timestamp
        );
    }
    
    // add authorized adapter (0=Worldcoin, 1=Gitcoin, 2=PoH, 3=BrightID)
    function addAdapter(address adapter, uint8 sourceId) external onlyOwner {
        if (adapter == address(0)) revert InvalidAddress();
        require(sourceId <= 3, "Invalid source ID");
        
        isAdapter[adapter] = true;
        adapterToSource[adapter] = sourceId;
        
        emit AdapterAdded(adapter, sourceId);
    }
    
    // check if user has at least 1 verification
    function isVerifiedHuman(address _address) external view returns (bool) {
        return userVerifications[_address].length > 0;
    }
    
    // trust score based on ERC-20 balance
    function getTrustScore(address _address) external view returns (uint256) {
        return verificationToken.balanceOf(_address) / (1 * 10**18);
    }
    
    // get verification count for user
    function getVerificationCount(address user) external view returns (uint256) {
        return userVerifications[user].length;
    }
    
    // withdraw tokens if needed (emergency or redistribution)
    function withdrawTokens(uint256 amount) external onlyOwner nonReentrant {
        require(
            verificationToken.transfer(owner(), amount),
            "Token transfer failed"
        );
    }
    
    // emergency stop
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }

    function removeAdapter(address adapter) external onlyOwner {
        if (adapter == address(0)) revert InvalidAddress();
        
        isAdapter[adapter] = false;
        delete adapterToSource[adapter];
        
        emit AdapterRemoved(adapter);
    }
}