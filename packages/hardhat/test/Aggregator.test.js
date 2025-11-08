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
    it("should return probability-based score", async function () {
      const proof = await mockGitcoinProof(oracle, user.address, 75);
      await gitcoinAdapter.verifyAndRegister(user.address, proof);

      const score = await aggregator.getTrustScore(user.address);
      expect(score).to.be.gt(0);
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

  describe("Bayesian Probability Model", function () {
    it("should return 0 for user without verifications", async function () {
      const probability = await aggregator.getHumanProbability(user.address);
      expect(probability).to.equal(0);
    });

    it("should calculate probability for single Gitcoin verification", async function () {
      const proof = await mockGitcoinProof(oracle, user.address, 75);
      await gitcoinAdapter.verifyAndRegister(user.address, proof);

      const probability = await aggregator.getHumanProbability(user.address);
      expect(probability).to.be.gt(0);
      expect(probability).to.be.lt(ethers.parseEther("1"));
    });

    it("should increase probability with multiple sources", async function () {
      const gitcoinProof = await mockGitcoinProof(oracle, user.address, 80);
      await gitcoinAdapter.verifyAndRegister(user.address, gitcoinProof);

      const prob1 = await aggregator.getHumanProbability(user.address);

      const { pohAdapter, brightidAdapter } = await deployAll();
      const pohProof = await mockPoHProof(oracle, user.address);
      await pohAdapter.verifyAndRegister(user.address, pohProof);

      const prob2 = await aggregator.getHumanProbability(user.address);
      expect(prob2).to.be.gt(prob1);
    });

    it("should adjust Gitcoin probability based on score", async function () {
      const lowScoreProof = await mockGitcoinProof(oracle, user.address, 25);
      await gitcoinAdapter.verifyAndRegister(user.address, lowScoreProof);
      const lowProb = await aggregator.getHumanProbability(user.address);

      const highScoreProof = await mockGitcoinProof(oracle, user2.address, 95);
      await gitcoinAdapter.verifyAndRegister(user2.address, highScoreProof);
      const highProb = await aggregator.getHumanProbability(user2.address);

      expect(highProb).to.be.gt(lowProb);
    });
  });

  describe("Anomaly Detection", function () {
    it("should detect too many recent verifications", async function () {
      const { pohAdapter, brightidAdapter } = await deployAll();
      
      for (let i = 0; i < 3; i++) {
        const gitcoinProof = await mockGitcoinProof(oracle, user.address, 50 + i);
        await gitcoinAdapter.verifyAndRegister(user.address, gitcoinProof);
      }
      
      for (let i = 0; i < 3; i++) {
        const pohProof = await mockPoHProof(oracle, user.address);
        await pohAdapter.verifyAndRegister(user.address, pohProof);
      }

      const isAnomaly = await aggregator.detectAnomaly(user.address);
      expect(isAnomaly).to.be.true;
    });

    it("should detect all low-quality Gitcoin scores", async function () {
      for (let i = 0; i < 3; i++) {
        const userId = ethers.keccak256(ethers.toUtf8Bytes(`user-${i}-${Date.now()}`));
        const timestamp = Math.floor(Date.now() / 1000);
        const score = 20 + i;
        
        const messageHash = ethers.solidityPackedKeccak256(
          ['address', 'bytes32', 'uint256', 'uint256'],
          [user.address, userId, score, timestamp]
        );
        const signature = await oracle.signMessage(ethers.getBytes(messageHash));
        
        const proof = ethers.AbiCoder.defaultAbiCoder().encode(
          ['bytes32', 'uint256', 'uint256', 'bytes'],
          [userId, score, timestamp, signature]
        );
        
        await gitcoinAdapter.verifyAndRegister(user.address, proof);
      }

      const isAnomaly = await aggregator.detectAnomaly(user.address);
      expect(isAnomaly).to.be.true;
    });

    it("should not detect anomaly for normal user", async function () {
      const proof = await mockGitcoinProof(oracle, user.address, 75);
      await gitcoinAdapter.verifyAndRegister(user.address, proof);

      const isAnomaly = await aggregator.detectAnomaly(user.address);
      expect(isAnomaly).to.be.false;
    });
  });

  describe("Attack Confirmation and Confidence Updates", function () {
    it("should update source stats on attack confirmation", async function () {
      const proof = await mockGitcoinProof(oracle, user.address, 75);
      await gitcoinAdapter.verifyAndRegister(user.address, proof);

      const statsBefore = await aggregator.sourceStats(1);
      await aggregator.confirmAttack(user.address, 1);
      const statsAfter = await aggregator.sourceStats(1);

      expect(statsAfter.confirmedAttacks).to.equal(statsBefore.confirmedAttacks + 1n);
    });

    it("should update confidence score after attack", async function () {
      const proof = await mockGitcoinProof(oracle, user.address, 75);
      await gitcoinAdapter.verifyAndRegister(user.address, proof);

      const confBefore = await aggregator.sourceConfidences(1);
      await aggregator.confirmAttack(user.address, 1);
      const confAfter = await aggregator.sourceConfidences(1);

      expect(confAfter.denominator).to.be.gt(confBefore.denominator);
    });

    it("should revert if user doesn't have source verification", async function () {
      await expect(
        aggregator.confirmAttack(user.address, 1)
      ).to.be.revertedWithCustomError(aggregator, "InvalidAddress");
    });
  });

  describe("Source Confidence Management", function () {
    it("should allow owner to set source confidence", async function () {
      await aggregator.setSourceConfidence(0, 9000, 9100);
      const conf = await aggregator.sourceConfidences(0);
      expect(conf.numerator).to.equal(9000);
      expect(conf.denominator).to.equal(9100);
    });

    it("should revert on invalid confidence values", async function () {
      await expect(
        aggregator.setSourceConfidence(0, 10000, 9000)
      ).to.be.revertedWithCustomError(aggregator, "InvalidConfidence");

      await expect(
        aggregator.setSourceConfidence(0, 1000, 0)
      ).to.be.revertedWithCustomError(aggregator, "InvalidConfidence");
    });
  });
});
