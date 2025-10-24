// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVerificationAdapter {
    function verifyAndRegister(address user, bytes calldata proof) external;
    function getSourceId() external view returns (uint8);
}