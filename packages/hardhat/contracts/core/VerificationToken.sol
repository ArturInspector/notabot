// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VerificationToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 1e18; // 1M tokens
    
    constructor() ERC20("HumanityToken", "HMT") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}