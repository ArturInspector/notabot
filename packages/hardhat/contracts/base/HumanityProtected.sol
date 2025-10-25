// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IHumanityOracle.sol";
// mixin for the easy integration
abstract contract HumanityProtected {
    IHumanityOracle public immutable humanityOracle;
    
    error NotVerifiedHuman(address user);
    error InsufficientTrustScore(address user, uint256 required, uint256 actual);
    error InvalidOracleAddress();
    event OracleSet(address indexed oracle);
    
    constructor(address _oracle) {
        if (_oracle == address(0)) revert InvalidOracleAddress();
        humanityOracle = IHumanityOracle(_oracle);
        emit OracleSet(_oracle);
    }

    modifier onlyHuman() {
        if (!humanityOracle.isVerifiedHuman(msg.sender)) {
            revert NotVerifiedHuman(msg.sender);
        }
        _;
    }
    modifier minTrustScore(uint256 required) {
        uint256 actual = humanityOracle.getTrustScore(msg.sender);
        if (actual < required) {
            revert InsufficientTrustScore(msg.sender, required, actual);
        }
        _;
    }
    function _getHumanityWeight(address user) internal view returns (uint256) {
        return humanityOracle.getTrustScore(user);
    }
    
    function _isVerifiedHuman(address user) internal view returns (bool) {
        return humanityOracle.isVerifiedHuman(user);
    }
}

