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
    mapping(bytes32 => bool) public invalidatedVerifications;
    
    uint256 public constant TOKEN_REWARD = 1 * 1e18;
    uint256 private constant PROBABILITY_BASE = 1e18;
    uint256 private constant SUSPICIOUS_THRESHOLD = 3; // 3 подозрительных подряд блокируют источник
    uint256 private constant WINDOW_DURATION = 1 hours; // Окно подозрительности
    
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
    
    struct SourceWindow {
        uint256 startTime;
        uint256 verificationCount;
        uint256 suspiciousCount;
    }
    
    struct CompromiseWindow {
        uint256 startTime;
        uint256 endTime;
        bool isCompromised;
    }
    
    mapping(uint8 => SourceConfidence) public sourceConfidences;
    mapping(uint8 => SourceStats) public sourceStats;
    mapping(uint8 => SourceWindow) public sourceWindows;
    mapping(uint8 => CompromiseWindow) public compromiseWindows;

    error UnauthorizedAdapter();
    error DuplicateVerification();
    error InvalidAddress();
    error SourceMismatch(uint8 expected, uint8 provided);
    error InvalidQualityScore();
    error InvalidConfidence();
    error SourceUnderAttack(uint8 sourceId);
    error InvalidTimeWindow();
    error VerificationNotFound();
    
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
    event VerificationInvalidated(bytes32 indexed uniqueId);
    event UserVerificationsInvalidated(address indexed user, uint8 indexed sourceId);
    event SourceCompromised(uint8 indexed sourceId, uint256 startTime, uint256 endTime);
    event SourceWindowReset(uint8 indexed sourceId);
    
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
        
        // Проверка на компрометацию источника в окне времени
        CompromiseWindow memory compromiseWindow = compromiseWindows[source];
        if (compromiseWindow.isCompromised && 
            block.timestamp >= compromiseWindow.startTime && 
            block.timestamp <= compromiseWindow.endTime) {
            revert SourceUnderAttack(source);
        }
        
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
        
        // Проверка на сибил-атаку в реальном времени
        SourceWindow memory window = sourceWindows[source];
        
        // Если окно истекло или пустое (startTime = 0), создаем новое
        if (window.startTime == 0 || block.timestamp > window.startTime + WINDOW_DURATION) {
            sourceWindows[source] = SourceWindow({
                startTime: block.timestamp,
                verificationCount: 1,
                suspiciousCount: 0
            });
            window = sourceWindows[source];
        } else {
            sourceWindows[source].verificationCount++;
        }
        
        // Проверка на аномалию (только если окно активно)
        if (window.startTime > 0 && block.timestamp <= window.startTime + WINDOW_DURATION) {
            // Если детектирована аномалия, увеличиваем счетчик подозрительных
            if (detectAnomaly(user)) {
                sourceWindows[source].suspiciousCount++;
                emit AnomalyDetected(user, "Suspicious pattern detected");
                
                // Если слишком много подозрительных подряд - блокируем источник временно
                if (sourceWindows[source].suspiciousCount >= SUSPICIOUS_THRESHOLD) {
                    revert SourceUnderAttack(source);
                }
            } else {
                // Если нормальная верификация, сбрасываем счетчик подозрительных
                sourceWindows[source].suspiciousCount = 0;
            }
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
        VerificationData[] memory verifications = userVerifications[_address];
        if (verifications.length == 0) return false;
        
        // Проверяем наличие хотя бы одной валидной верификации
        for (uint i = 0; i < verifications.length; i++) {
            if (isVerificationValid(_address, i)) {
                return true;
            }
        }
        return false;
    }
    
    function isVerificationValid(address user, uint256 index) public view returns (bool) {
        require(index < userVerifications[user].length, "Index out of bounds");
        VerificationData memory verification = userVerifications[user][index];
        
        // Проверка на инвалидацию
        if (invalidatedVerifications[verification.uniqueId]) return false;
        
        // Проверка на компрометацию источника
        CompromiseWindow memory window = compromiseWindows[verification.source];
        if (window.isCompromised && 
            verification.timestamp >= window.startTime && 
            verification.timestamp <= window.endTime) {
            return false;
        }
        
        return true;
    }
    
    function getHumanProbability(address user) public view returns (uint256) {
        VerificationData[] memory verifications = userVerifications[user];
        if (verifications.length == 0) return 0;
        
        uint256 notHumanProb = PROBABILITY_BASE;
        bool hasValidVerification = false;
        
        for (uint i = 0; i < verifications.length; i++) {
            // Пропускаем инвалидированные верификации
            if (!isVerificationValid(user, i)) continue;
            
            hasValidVerification = true;
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
        
        if (!hasValidVerification) return 0;
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
        
        uint256 lowScoreCount = 0;
        
        for (uint i = 0; i < verifications.length; i++) {
            if (verifications[i].source == 1 && verifications[i].qualityScore < 30) {
                lowScoreCount++;
            }
        }
        
        // Подозрительно: все верификации от Gitcoin имеют низкий qualityScore
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
    
    function invalidateVerification(bytes32 uniqueId) external onlyOwner {
        if (!usedUniqueIds[uniqueId]) revert VerificationNotFound();
        invalidatedVerifications[uniqueId] = true;
        emit VerificationInvalidated(uniqueId);
    }
    
    function invalidateUserVerifications(address user, uint8 sourceId) external onlyOwner {
        if (user == address(0)) revert InvalidAddress();
        VerificationData[] memory verifications = userVerifications[user];
        bool found = false;
        
        for (uint i = 0; i < verifications.length; i++) {
            if (verifications[i].source == sourceId) {
                invalidatedVerifications[verifications[i].uniqueId] = true;
                found = true;
            }
        }
        
        if (!found) revert VerificationNotFound();
        emit UserVerificationsInvalidated(user, sourceId);
    }
    
    function markSourceCompromised(
        uint8 sourceId,
        uint256 startTime,
        uint256 endTime
    ) external onlyOwner {
        if (endTime <= startTime) revert InvalidTimeWindow();
        if (endTime > block.timestamp + 365 days) revert InvalidTimeWindow(); // Защита: не более года вперед
        
        compromiseWindows[sourceId] = CompromiseWindow({
            startTime: startTime,
            endTime: endTime,
            isCompromised: true
        });
        
        emit SourceCompromised(sourceId, startTime, endTime);
    }
    
    function resetSourceWindow(uint8 sourceId) external onlyOwner {
        sourceWindows[sourceId] = SourceWindow({
            startTime: block.timestamp,
            verificationCount: 0,
            suspiciousCount: 0
        });
        emit SourceWindowReset(sourceId);
    }
}