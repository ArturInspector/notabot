// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./VerificationToken.sol";
import "./VerificationSBT.sol";

contract MainAggregator is Ownable, ReentrancyGuard, Pausable {
    
    VerificationToken public immutable verificationToken;
    VerificationSBT public immutable verificationSBT;
    mapping(address => bool) public isAdapter;
    mapping(address => uint8) public adapterToSource;
    mapping(address => VerificationData[]) public userVerifications;
    mapping(bytes32 => bool) public usedUniqueIds;
    
    uint256 public constant BASE_SCORE = 10;
    uint256 public constant TOKEN_REWARD = 100 * 10**18;
    
    struct VerificationData {
        uint8 source;
        uint256 timestamp;
        bytes32 uniqueId;
        uint256 sbtTokenId;
    }

    error UnauthorizedAdapter();
    error DuplicateVerification();
    error InvalidAddress();
    
    event VerificationRegistered(
        address indexed user,
        uint8 indexed source,
        bytes32 uniqueId,
        uint256 sbtTokenId,
        uint256 timestamp
    );
    event VerificationRevoked(address indexed user, uint256 tokenId, string reason);
    event AdapterAdded(address indexed adapter, uint8 sourceId);
    event AdapterRemoved(address indexed adapter);
    
    constructor(address _tokenAddr, address _sbtAddr) Ownable(msg.sender) {
        if (_tokenAddr == address(0) || _sbtAddr == address(0)) {
            revert InvalidAddress();
        }
        
        verificationToken = VerificationToken(_tokenAddr);
        verificationSBT = VerificationSBT(_sbtAddr);
    }
    
    // verification from authorized adapter
    // within CEI pattern
    function registerVerification(
        address user,
        uint8 source,
        bytes32 uniqueId,
        bytes calldata proof
    ) external nonReentrant whenNotPaused {
        if (!isAdapter[msg.sender]) revert UnauthorizedAdapter();
        if (user == address(0)) revert InvalidAddress();
        if (usedUniqueIds[uniqueId]) revert DuplicateVerification();
        usedUniqueIds[uniqueId] = true;
        
        uint256 sbtTokenId = verificationSBT.totalSupply();
        
        userVerifications[user].push(VerificationData({
            source: source,
            timestamp: block.timestamp,
            uniqueId: uniqueId,
            sbtTokenId: sbtTokenId
        }));

        verificationToken.mint(user, TOKEN_REWARD);
        verificationSBT.mint(user, source, uniqueId);
        
        emit VerificationRegistered(
            user,
            source,
            uniqueId,
            sbtTokenId,
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
    
    // check if user has at least 1 SBT
    function isVerifiedHuman(address user) external view returns (bool) {
        return verificationSBT.balanceOf(user) > 0;
    }
    
    // calculate trust score
    function getTrustScore(address user) external view returns (uint256) {
        uint256 count = userVerifications[user].length;
        if (count == 0) return 0;
        
        uint256 score = BASE_SCORE * count;
        
        // time bonus: +2 per month since first verification
        uint256 firstVerifTime = userVerifications[user][0].timestamp;
        uint256 monthsPassed = (block.timestamp - firstVerifTime) / 30 days;
        score += monthsPassed * 2;
        
        // multi-source bonus: +5 if more than 1 source
        if (count > 1) {
            score += 5;
        }
        
        return score;
    }
    
    // get verification count for user
    function getVerificationCount(address user) external view returns (uint256) {
        return userVerifications[user].length;
    }
    
    function revokeVerification(
        address user,
        uint256 tokenId,
        string calldata reason
    ) external onlyOwner nonReentrant {
        if (user == address(0)) revert InvalidAddress();
        
        verificationSBT.burn(tokenId);
        
        emit VerificationRevoked(user, tokenId, reason);
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