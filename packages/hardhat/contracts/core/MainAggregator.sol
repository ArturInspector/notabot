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
    uint256 private constant PROBABILITY_BASE = 1e18;
    
    struct VerificationData {
        uint8 source;
        uint256 timestamp;
        bytes32 uniqueId;
        uint256 qualityScore;
    }
    
    struct SourceConfidence {
        uint256 numerator;
        uint256 denominator;
    }
    
    struct SourceStats {
        uint256 totalVerifications;
        uint256 confirmedAttacks;
        uint256 lastUpdate;
    }
    
    mapping(uint8 => SourceConfidence) public sourceConfidences;
    mapping(uint8 => SourceStats) public sourceStats;

    error UnauthorizedAdapter();
    error DuplicateVerification();
    error InvalidAddress();
    error SourceMismatch(uint8 expected, uint8 provided);
    error InvalidQualityScore();
    error InvalidConfidence();
    
    event VerificationRegistered(
        address indexed user,
        uint8 indexed source,
        bytes32 uniqueId,
        uint256 timestamp,
        uint256 qualityScore
    );
    event TokensRevoked(address indexed user, uint256 amount);
    event AdapterAdded(address indexed adapter, uint8 sourceId);
    event AdapterRemoved(address indexed adapter);
    event AnomalyDetected(address indexed user, string reason);
    event ConfidenceUpdated(uint8 indexed sourceId, uint256 numerator, uint256 denominator);
    event AttackConfirmed(uint8 indexed sourceId, address indexed user);
    
    constructor(address _tokenAddr) Ownable(msg.sender) {
        if (_tokenAddr == address(0)) {
            revert InvalidAddress();
        }
        
        verificationToken = IERC20(_tokenAddr);
        
        sourceConfidences[0] = SourceConfidence({numerator: 9500, denominator: 9501});
        sourceConfidences[1] = SourceConfidence({numerator: 8000, denominator: 8800});
        sourceConfidences[2] = SourceConfidence({numerator: 7000, denominator: 8800});
        sourceConfidences[3] = SourceConfidence({numerator: 7500, denominator: 9000});
    }
    function registerVerification(
        address user,
        uint8 source,
        bytes32 uniqueId,
        bytes calldata proof
    ) external nonReentrant whenNotPaused {
        if (!isAdapter[msg.sender]) revert UnauthorizedAdapter();
        uint8 expectedSource = adapterToSource[msg.sender];
        if (source != expectedSource) revert SourceMismatch(expectedSource, source);
        
        if (user == address(0)) revert InvalidAddress();
        if (usedUniqueIds[uniqueId]) revert DuplicateVerification();
        usedUniqueIds[uniqueId] = true;
        
        uint256 qualityScore = 100;
        if (source == 1) {
            (, uint256 score, , ) = abi.decode(proof, (bytes32, uint256, uint256, bytes));
            if (score > 100) revert InvalidQualityScore();
            qualityScore = score;
        }
        
        userVerifications[user].push(VerificationData({
            source: source,
            timestamp: block.timestamp,
            uniqueId: uniqueId,
            qualityScore: qualityScore
        }));
        
        sourceStats[source].totalVerifications++;
        sourceStats[source].lastUpdate = block.timestamp;
        
        if (detectAnomaly(user)) {
            emit AnomalyDetected(user, "Suspicious pattern detected");
        }

        require(
            verificationToken.transfer(user, TOKEN_REWARD),
            "Token transfer failed"
        );
        
        emit VerificationRegistered(
            user,
            source,
            uniqueId,
            block.timestamp,
            qualityScore
        );
    }
    
    function addAdapter(address adapter, uint8 sourceId) external onlyOwner {
        if (adapter == address(0)) revert InvalidAddress();
        require(sourceId <= 3, "Invalid source ID");
        
        isAdapter[adapter] = true;
        adapterToSource[adapter] = sourceId;
        
        emit AdapterAdded(adapter, sourceId);
    }
    
    function isVerifiedHuman(address _address) external view returns (bool) {
        return userVerifications[_address].length > 0;
    }
    
    function getHumanProbability(address user) public view returns (uint256) {
        VerificationData[] memory verifications = userVerifications[user];
        if (verifications.length == 0) return 0;
        
        uint256 notHumanProb = PROBABILITY_BASE;
        
        for (uint i = 0; i < verifications.length; i++) {
            SourceConfidence memory conf = sourceConfidences[verifications[i].source];
            uint256 baseConfidence = (conf.numerator * PROBABILITY_BASE) / conf.denominator;
            
            uint256 adjustedConfidence = baseConfidence;
            if (verifications[i].source == 1) {
                uint256 scoreMultiplier = (verifications[i].qualityScore * 1e16) / 100;
                adjustedConfidence = (baseConfidence * scoreMultiplier) / 1e16;
            }
            
            uint256 notConfidence = PROBABILITY_BASE - adjustedConfidence;
            notHumanProb = (notHumanProb * notConfidence) / PROBABILITY_BASE;
        }
        
        return PROBABILITY_BASE - notHumanProb;
    }

    function getTrustScore(address _address) external view returns (uint256) {
        uint256 probability = getHumanProbability(_address);
        return probability / 1e16;
    }
    
    function getVerificationCount(address user) external view returns (uint256) {
        return userVerifications[user].length;
    }
    function getVerificationByIndex(address user, uint256 index) external view returns (VerificationData memory) {
        require(index < userVerifications[user].length, "Index out of bounds");
        return userVerifications[user][index];
    }
    function getAllVerifications(address user) external view returns (VerificationData[] memory) {
        return userVerifications[user];
    }
    
    function detectAnomaly(address user) public view returns (bool) {
        VerificationData[] memory verifications = userVerifications[user];
        if (verifications.length == 0) return false;
        
        uint256 recentCount = 0;
        uint256 lowScoreCount = 0;
        uint256 oneDayAgo = block.timestamp - 1 days;
        
        for (uint i = 0; i < verifications.length; i++) {
            if (verifications[i].timestamp > oneDayAgo) {
                recentCount++;
            }
            
            if (verifications[i].source == 1 && verifications[i].qualityScore < 30) {
                lowScoreCount++;
            }
        }
        
        if (recentCount > 5) return true;
        if (lowScoreCount == verifications.length && verifications.length > 2) return true;
        
        return false;
    }
    
    function confirmAttack(address user, uint8 sourceId) external onlyOwner {
        VerificationData[] memory verifications = userVerifications[user];
        bool hasSource = false;
        
        for (uint i = 0; i < verifications.length; i++) {
            if (verifications[i].source == sourceId) {
                hasSource = true;
                break;
            }
        }
        
        if (!hasSource) revert InvalidAddress();
        
        sourceStats[sourceId].confirmedAttacks++;
        sourceStats[sourceId].lastUpdate = block.timestamp;
        
        emit AttackConfirmed(sourceId, user);
        
        updateSourceConfidence(sourceId);
    }
    function updateSourceConfidence(uint8 sourceId) public {
        SourceStats memory stats = sourceStats[sourceId];
        if (stats.totalVerifications == 0) return;
        
        uint256 newFPR = (stats.confirmedAttacks * 10000) / stats.totalVerifications;
        
        SourceConfidence memory conf = sourceConfidences[sourceId];
        uint256 baseTPR = conf.numerator;
        uint256 newDenominator = baseTPR + newFPR;
        
        if (newDenominator == 0) revert InvalidConfidence();
        
        sourceConfidences[sourceId].denominator = newDenominator;
        
        emit ConfidenceUpdated(sourceId, conf.numerator, newDenominator);
    }
    
    function setSourceConfidence(uint8 sourceId, uint256 numerator, uint256 denominator) external onlyOwner {
        if (denominator == 0 || numerator > denominator) revert InvalidConfidence();
        sourceConfidences[sourceId] = SourceConfidence({numerator: numerator, denominator: denominator});
        emit ConfidenceUpdated(sourceId, numerator, denominator);
    }
    
    function withdrawTokens(uint256 amount) external onlyOwner nonReentrant {
        require(
            verificationToken.transfer(owner(), amount),
            "Token transfer failed"
        );
    }
    
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