import { expect } from 'chai';
import { ethers } from 'ethers';
import { signerService } from '../src/services/signer.js';

describe('SignerService', () => {
  describe('signGitcoinProof', () => {
    it('should sign Gitcoin proof correctly', async () => {
      const userAddress = '0x1234567890123456789012345678901234567890';
      const userId = ethers.keccak256(ethers.toUtf8Bytes('test-user'));
      const score = 75;
      const timestamp = Math.floor(Date.now() / 1000);

      const signature = await signerService.signGitcoinProof(userAddress, userId, score, timestamp);
      
      expect(signature).to.be.a('string');
      expect(signature).to.have.lengthOf(132);
      expect(signature).to.match(/^0x[a-fA-F0-9]{130}$/);
    });

    it('should produce consistent signatures', async () => {
      const userAddress = '0x1234567890123456789012345678901234567890';
      const userId = ethers.keccak256(ethers.toUtf8Bytes('test'));
      const score = 50;
      const timestamp = 1234567890;

      const sig1 = await signerService.signGitcoinProof(userAddress, userId, score, timestamp);
      const sig2 = await signerService.signGitcoinProof(userAddress, userId, score, timestamp);
      
      expect(sig1).to.equal(sig2);
    });
  });

  describe('signPoHProof', () => {
    it('should sign PoH proof correctly', async () => {
      const userAddress = '0x1234567890123456789012345678901234567890';
      const pohId = ethers.keccak256(ethers.toUtf8Bytes('poh-user'));
      const timestamp = Math.floor(Date.now() / 1000);

      const signature = await signerService.signPoHProof(userAddress, pohId, timestamp);
      
      expect(signature).to.be.a('string');
      expect(signature).to.have.lengthOf(132);
    });
  });

  describe('signBrightIDProof', () => {
    it('should sign BrightID proof correctly', async () => {
      const userAddress = '0x1234567890123456789012345678901234567890';
      const contextId = ethers.keccak256(ethers.toUtf8Bytes('brightid-user'));
      const timestamp = Math.floor(Date.now() / 1000);

      const signature = await signerService.signBrightIDProof(userAddress, contextId, timestamp);
      
      expect(signature).to.be.a('string');
      expect(signature).to.have.lengthOf(132);
    });
  });

  describe('createUserId', () => {
    it('should create deterministic userId', () => {
      const userId1 = signerService.createUserId('gitcoin', '0xabc', 'data');
      const userId2 = signerService.createUserId('gitcoin', '0xabc', 'data');
      
      expect(userId1).to.equal(userId2);
      expect(userId1).to.match(/^0x[a-fA-F0-9]{64}$/);
    });

    it('should create different userId for different inputs', () => {
      const userId1 = signerService.createUserId('gitcoin', '0xabc', 'data1');
      const userId2 = signerService.createUserId('gitcoin', '0xabc', 'data2');
      
      expect(userId1).to.not.equal(userId2);
    });
  });

  describe('getAddress', () => {
    it('should return valid address', () => {
      const address = signerService.getAddress();
      expect(address).to.match(/^0x[a-fA-F0-9]{40}$/);
    });
  });
});

