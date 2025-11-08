// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../core/MainAggregator.sol";

/**
 * @title MockAdapter
 * @notice Тестовый адаптер для проверки SourceMismatch защиты
 */
contract MockAdapter {
    MainAggregator public immutable mainAggregator;
    
    constructor(address _mainAggregator) {
        mainAggregator = MainAggregator(_mainAggregator);
    }
    
    /**
     * @notice Вызывает registerVerification напрямую с указанным source
     * @dev Используется для тестирования проверки SourceMismatch
     */
    function callRegisterVerification(
        address user,
        uint8 source,
        bytes32 uniqueId,
        bytes calldata proof
    ) external {
        mainAggregator.registerVerification(user, source, uniqueId, proof);
    }
}

