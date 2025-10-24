pragma solidity ^0.8.20;

interface IVerificationAdapter {
    function verify(address _address) external view returns (bool);
    function getTrustScore(address _address) external view returns (uint256);
}