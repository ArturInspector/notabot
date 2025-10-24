pragma solidity ^0.8.20;

interface IHumanityOracle {
    function isVerifiedHuman(address _address) external view returns (bool);
    function getTrustScore(address _address) external view returns (uint256);
    function getVerificationCount(address _address) external view returns (uint256);
}