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

  async signGitcoinProof(userAddress, userId, score, timestamp) {
    const messageHash = ethers.solidityPackedKeccak256(
      ['address', 'bytes32', 'uint256', 'uint256'],
      [userAddress, userId, score, timestamp]
    );
    return await this.wallet.signMessage(ethers.getBytes(messageHash));
  }

  async signPoHProof(userAddress, pohId, timestamp) {
    const messageHash = ethers.solidityPackedKeccak256(
      ['address', 'bytes32', 'uint256'],
      [userAddress, pohId, timestamp]
    );
    return await this.wallet.signMessage(ethers.getBytes(messageHash));
  }

  async signBrightIDProof(userAddress, contextId, timestamp) {
    const messageHash = ethers.solidityPackedKeccak256(
      ['address', 'bytes32', 'uint256'],
      [userAddress, contextId, timestamp]
    );
    return await this.wallet.signMessage(ethers.getBytes(messageHash));
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
