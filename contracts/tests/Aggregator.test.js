const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployAll, mockGitcoinProof } = require("./helpers");

describe("MainAggregator", function() {
  let aggregator, token, sbt, gitcoinAdapter, owner, user, user2, oracle;
  
  beforeEach(async function() {
    ({ aggregator, token, sbt, gitcoinAdapter, owner, user, user2, oracle } = await deployAll());
  });
  
  describe("Deployment", function() {
    it("should deploy all contracts", async function() {
      expect(await aggregator.getAddress()).to.be.properAddress;
      expect(await token.getAddress()).to.be.properAddress;
      expect(await sbt.getAddress()).to.be.properAddress;
    });
    
    it("should set correct roles", async function() {
      const MINTER_ROLE = await token.MINTER_ROLE();
      expect(await token.hasRole(MINTER_ROLE, aggregator.getAddress())).to.be.true;
    });
  });
  
  describe("registerVerification", function() {
    it("should mint tokens on verification", async function() {
      const proof = await mockGitcoinProof(oracle, user.address);
      
      await gitcoinAdapter.verifyAndRegister(user.address, proof);
      
      const TOKEN_REWARD = await aggregator.TOKEN_REWARD();
      expect(await token.balanceOf(user.address)).to.equal(TOKEN_REWARD);
      expect(await sbt.balanceOf(user.address)).to.equal(1);
    });
    
    it("should revert if not from adapter", async function() {
      const userId = ethers.randomBytes(32);
      const proof = "0x";
      
      await expect(
        aggregator.registerVerification(user.address, 0, userId, proof)
      ).to.be.revertedWithCustomError(aggregator, "UnauthorizedAdapter");
    });
    
    it("should revert on duplicate uniqueId", async function() {
      const proof = await mockGitcoinProof(oracle, user.address);
      
      await gitcoinAdapter.verifyAndRegister(user.address, proof);
      
      await expect(
        gitcoinAdapter.verifyAndRegister(user2.address, proof)
      ).to.be.revertedWithCustomError(aggregator, "DuplicateVerification");
    });
  });
  
  describe("isVerifiedHuman", function() {
    it("should return true after verification", async function() {
      const proof = await mockGitcoinProof(oracle, user.address);
      await gitcoinAdapter.verifyAndRegister(user.address, proof);
      
      expect(await aggregator.isVerifiedHuman(user.address)).to.be.true;
    });
    
    it("should return false without verification", async function() {
      expect(await aggregator.isVerifiedHuman(user.address)).to.be.false;
    });
  });
  
  describe("getTrustScore", function() {
    it("should return correct score", async function() {
      const proof = await mockGitcoinProof(oracle, user.address);
      await gitcoinAdapter.verifyAndRegister(user.address, proof);
      
      const TOKEN_REWARD = await aggregator.TOKEN_REWARD();
      const score = await aggregator.getTrustScore(user.address);
      
      expect(score).to.equal(await token.balanceOf(user.address) / TOKEN_REWARD);
    });
  });
  
  describe("addAdapter", function() {
    it("should add adapter", async function() {
      const newAdapter = ethers.Wallet.createRandom().address;
      
      await aggregator.addAdapter(newAdapter, 2);
      
      expect(await aggregator.isAdapter(newAdapter)).to.be.true;
    });
    
    it("should revert if not owner", async function() {
      const newAdapter = ethers.Wallet.createRandom().address;
      
      await expect(
        aggregator.connect(user).addAdapter(newAdapter, 2)
      ).to.be.revertedWithCustomError(aggregator, "OwnableUnauthorizedAccount");
    });
  });
});

describe("VerificationSBT", function() {
  let sbt, owner, user, user2;
  
  beforeEach(async function() {
    ({ sbt, owner, user, user2 } = await deployAll());
  });
  
  describe("Soulbound", function() {
    it("should mint SBT", async function() {
      const MINTER_ROLE = await sbt.MINTER_ROLE();
      await sbt.grantRole(MINTER_ROLE, owner.address);
      
      await sbt.mint(user.address, 0, ethers.randomBytes(32));
      
      expect(await sbt.balanceOf(user.address)).to.equal(1);
    });
    
    it("should block transfers", async function() {
      const MINTER_ROLE = await sbt.MINTER_ROLE();
      await sbt.grantRole(MINTER_ROLE, owner.address);
      
      await sbt.mint(user.address, 0, ethers.randomBytes(32));
      const tokenId = 0;
      
      await expect(
        sbt.connect(user).transferFrom(user.address, user2.address, tokenId)
      ).to.be.revertedWithCustomError(sbt, "TransferNotAllowed");
    });
  });
});

