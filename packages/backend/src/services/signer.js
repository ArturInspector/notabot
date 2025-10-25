// ecdsa signing service
import { ethers } from 'ethers';
import { config } from '../config/env.js';

class SignerService {
  constructor() {
    this.wallet = new ethers.Wallet(config.BACKEND_PRIVATE_KEY);
  }
  getAddress() {
    return this.wallet.address;
  }

  /**
   * Sign Gitcoin verification data
   * Must match GitcoinAdapter.sol line 41:
   * keccak256(abi.encodePacked(user, userId, score, timestamp))
   * 
   * @param {string} userAddress - User's wallet address
   * @param {string} userId - Unique ID (bytes32)
   * @param {number} score - Gitcoin score (uint256)
   * @param {number} timestamp - Unix timestamp (uint256)
   * @returns {string} ECDSA signature
   */
  async signGitcoinProof(userAddress, userId, score, timestamp) {
    const messageHash = ethers.solidityPackedKeccak256(
      ['address', 'bytes32', 'uint256', 'uint256'],
      [userAddress, userId, score, timestamp]
    );
    const signature = await this.wallet.signMessage(ethers.getBytes(messageHash));
    
    return signature;
  }

  /**
   * Create userId from user data (deterministic hash)
   * @param {string} source - Source name (e.g., "gitcoin")
   * @param {string} userAddress - User address
   * @param {string} uniqueData - Unique data (e.g., rawScore, passport_id)
   * @returns {string} bytes32 hash
   */
  createUserId(source, userAddress, uniqueData) {
    return ethers.keccak256(
      ethers.toUtf8Bytes(`${source}:${userAddress}:${uniqueData}`)
    );
  }
}

export const signerService = new SignerService();
