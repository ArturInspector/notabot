const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployAll, mockGitcoinProof } = require("./helpers");

describe("MainAggregator", function () {
  let aggregator, token, gitcoinAdapter, owner, user, user2, oracle;

  beforeEach(async function () {
    ({ aggregator, token, gitcoinAdapter, owner, user, user2, oracle } = await deployAll());
  });

  describe("Deployment", function () {
    it("should deploy all contracts", async function () {
      expect(await aggregator.getAddress()).to.be.properAddress;
      expect(await token.getAddress()).to.be.properAddress;
    });

    it("should transfer tokens to aggregator", async function () {
      const aggregatorBalance = await token.balanceOf(await aggregator.getAddress());
      expect(aggregatorBalance).to.equal(ethers.parseEther("500000"));
    });
  });

  describe("registerVerification", function () {
    it("should transfer tokens on verification", async function () {
      const proof = await mockGitcoinProof(oracle, user.address);

      await gitcoinAdapter.verifyAndRegister(user.address, proof);

      const TOKEN_REWARD = await aggregator.TOKEN_REWARD();
      expect(await token.balanceOf(user.address)).to.equal(TOKEN_REWARD);
      expect(await aggregator.getVerificationCount(user.address)).to.equal(1);
    });

    it("should revert if not from adapter", async function () {
      const userId = ethers.randomBytes(32);
      const proof = "0x";

      await expect(aggregator.registerVerification(user.address, 0, userId, proof)).to.be.revertedWithCustomError(
        aggregator,
        "UnauthorizedAdapter",
      );
    });

    it("should revert on duplicate uniqueId", async function () {
      const proof = await mockGitcoinProof(oracle, user.address);

      await gitcoinAdapter.verifyAndRegister(user.address, proof);

      // Same userId (proof) cannot be used again - GitcoinAdapter checks this
      await expect(gitcoinAdapter.verifyAndRegister(user2.address, proof)).to.be.revertedWithCustomError(
        gitcoinAdapter,
        "ProofAlreadyUsed",
      );
    });
  });

  describe("isVerifiedHuman", function () {
    it("should return true after verification", async function () {
      const proof = await mockGitcoinProof(oracle, user.address);
      await gitcoinAdapter.verifyAndRegister(user.address, proof);

      expect(await aggregator.isVerifiedHuman(user.address)).to.be.true;
    });

    it("should return false without verification", async function () {
      expect(await aggregator.isVerifiedHuman(user.address)).to.be.false;
    });
  });

  describe("getTrustScore", function () {
    it("should return correct score", async function () {
      const proof = await mockGitcoinProof(oracle, user.address);
      await gitcoinAdapter.verifyAndRegister(user.address, proof);

      const TOKEN_REWARD = await aggregator.TOKEN_REWARD();
      const score = await aggregator.getTrustScore(user.address);

      expect(score).to.equal((await token.balanceOf(user.address)) / TOKEN_REWARD);
    });
  });

  describe("addAdapter", function () {
    it("should add adapter", async function () {
      const newAdapter = ethers.Wallet.createRandom().address;

      await aggregator.addAdapter(newAdapter, 2);

      expect(await aggregator.isAdapter(newAdapter)).to.be.true;
    });

    it("should revert if not owner", async function () {
      const newAdapter = ethers.Wallet.createRandom().address;

      await expect(aggregator.connect(user).addAdapter(newAdapter, 2)).to.be.revertedWithCustomError(
        aggregator,
        "OwnableUnauthorizedAccount",
      );
    });
  });

  describe("SourceMismatch protection", function () {
    it("should revert if adapter tries to use wrong source", async function () {
      const MockAdapter = await ethers.getContractFactory("MockAdapter");
      const mockAdapter = await MockAdapter.deploy(await aggregator.getAddress());
      await mockAdapter.waitForDeployment();
      await aggregator.addAdapter(await mockAdapter.getAddress(), 1);
      
      const userId = ethers.randomBytes(32);
      await expect(
        mockAdapter.callRegisterVerification(user.address, 0, userId, "0x")
      ).to.be.revertedWithCustomError(aggregator, "SourceMismatch");
    });

    it("should accept correct source from adapter", async function () {
      const proof = await mockGitcoinProof(oracle, user.address);
      await gitcoinAdapter.verifyAndRegister(user.address, proof);
      
      const verifications = await aggregator.getAllVerifications(user.address);
      expect(verifications.length).to.equal(1);
      expect(verifications[0].source).to.equal(1); // Gitcoin = 1
    });
  });

  describe("getVerificationByIndex", function () {
    it("should return verification at specific index", async function () {
      const proof = await mockGitcoinProof(oracle, user.address);
      await gitcoinAdapter.verifyAndRegister(user.address, proof);

      const verification = await aggregator.getVerificationByIndex(user.address, 0);
      expect(verification.source).to.equal(1); // Gitcoin
      expect(verification.timestamp).to.be.gt(0);
      expect(verification.uniqueId).to.not.equal(ethers.ZeroHash);
    });

    it("should revert if index out of bounds", async function () {
      await expect(
        aggregator.getVerificationByIndex(user.address, 0)
      ).to.be.revertedWith("Index out of bounds");
    });
  });

  describe("getAllVerifications", function () {
    it("should return empty array for user without verifications", async function () {
      const verifications = await aggregator.getAllVerifications(user.address);
      expect(verifications.length).to.equal(0);
    });

    it("should return all verifications for user", async function () {
      const proof1 = await mockGitcoinProof(oracle, user.address);
      await gitcoinAdapter.verifyAndRegister(user.address, proof1);

      const verifications = await aggregator.getAllVerifications(user.address);
      expect(verifications.length).to.equal(1);
      expect(verifications[0].source).to.equal(1);
    });
  });
});
