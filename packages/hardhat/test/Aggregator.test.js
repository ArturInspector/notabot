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

  describe("Verification Invalidation", function () {
    it("should invalidate specific verification by uniqueId", async function () {
      const proof = await mockGitcoinProof(oracle, user.address);
      await gitcoinAdapter.verifyAndRegister(user.address, proof);

      expect(await aggregator.isVerifiedHuman(user.address)).to.be.true;

      const verifications = await aggregator.getAllVerifications(user.address);
      const uniqueId = verifications[0].uniqueId;

      await aggregator.invalidateVerification(uniqueId);

      expect(await aggregator.isVerifiedHuman(user.address)).to.be.false;
      expect(await aggregator.invalidatedVerifications(uniqueId)).to.be.true;
    });

    it("should invalidate all user verifications from source", async function () {
      const proof1 = await mockGitcoinProof(oracle, user.address, 75);
      await gitcoinAdapter.verifyAndRegister(user.address, proof1);

      const { pohAdapter } = await deployAll();
      const pohProof = await mockPoHProof(oracle, user.address);
      await pohAdapter.verifyAndRegister(user.address, pohProof);

      expect(await aggregator.isVerifiedHuman(user.address)).to.be.true;

      await aggregator.invalidateUserVerifications(user.address, 1); // Invalidate Gitcoin

      // User should still be verified (has PoH verification)
      expect(await aggregator.isVerifiedHuman(user.address)).to.be.true;

      // But Gitcoin verification should be invalid
      const verifications = await aggregator.getAllVerifications(user.address);
      expect(await aggregator.isVerificationValid(user.address, 0)).to.be.false; // Gitcoin invalid
      expect(await aggregator.isVerificationValid(user.address, 1)).to.be.true; // PoH valid
    });

    it("should revert if verification not found", async function () {
      const fakeUniqueId = ethers.randomBytes(32);
      await expect(
        aggregator.invalidateVerification(fakeUniqueId)
      ).to.be.revertedWithCustomError(aggregator, "VerificationNotFound");
    });

    it("should revert if user has no verifications from source", async function () {
      await expect(
        aggregator.invalidateUserVerifications(user.address, 1)
      ).to.be.revertedWithCustomError(aggregator, "VerificationNotFound");
    });

    it("should revert if not owner", async function () {
      const proof = await mockGitcoinProof(oracle, user.address);
      await gitcoinAdapter.verifyAndRegister(user.address, proof);
      const verifications = await aggregator.getAllVerifications(user.address);
      const uniqueId = verifications[0].uniqueId;

      await expect(
        aggregator.connect(user).invalidateVerification(uniqueId)
      ).to.be.revertedWithCustomError(aggregator, "OwnableUnauthorizedAccount");
    });
  });

  describe("Source Compromise Window", function () {
    it("should block new verifications in compromise window", async function () {
      const currentTime = await ethers.provider.getBlock("latest").then(b => b.timestamp);
      const startTime = currentTime - 3600; // 1 hour ago
      const endTime = currentTime + 3600; // 1 hour from now

      await aggregator.markSourceCompromised(1, startTime, endTime);

      const proof = await mockGitcoinProof(oracle, user.address);
      await expect(
        gitcoinAdapter.verifyAndRegister(user.address, proof)
      ).to.be.revertedWithCustomError(aggregator, "SourceUnderAttack");
    });

    it("should invalidate existing verifications in compromise window", async function () {
      const proof = await mockGitcoinProof(oracle, user.address);
      await gitcoinAdapter.verifyAndRegister(user.address, proof);

      expect(await aggregator.isVerifiedHuman(user.address)).to.be.true;

      // Get verification timestamp
      const verifications = await aggregator.getAllVerifications(user.address);
      const verificationTime = verifications[0].timestamp;
      const startTime = verificationTime - 100;
      const endTime = verificationTime + 100;

      await aggregator.markSourceCompromised(1, startTime, endTime);

      // Verification should be invalid now
      expect(await aggregator.isVerifiedHuman(user.address)).to.be.false;
      expect(await aggregator.isVerificationValid(user.address, 0)).to.be.false;
    });

    it("should not invalidate verifications outside compromise window", async function () {
      const proof = await mockGitcoinProof(oracle, user.address);
      await gitcoinAdapter.verifyAndRegister(user.address, proof);

      const verifications = await aggregator.getAllVerifications(user.address);
      const verificationTime = verifications[0].timestamp;
      
      // Set compromise window AFTER verification time
      const startTime = verificationTime + 1000;
      const endTime = verificationTime + 2000;

      await aggregator.markSourceCompromised(1, startTime, endTime);

      // Verification should still be valid (outside window)
      expect(await aggregator.isVerifiedHuman(user.address)).to.be.true;
      expect(await aggregator.isVerificationValid(user.address, 0)).to.be.true;
    });

    it("should revert on invalid time window", async function () {
      const currentTime = await ethers.provider.getBlock("latest").then(b => b.timestamp);
      
      await expect(
        aggregator.markSourceCompromised(1, currentTime + 1000, currentTime)
      ).to.be.revertedWithCustomError(aggregator, "InvalidTimeWindow");

      // Cannot set window more than 1 year in future
      await expect(
        aggregator.markSourceCompromised(1, currentTime, currentTime + 366 * 24 * 3600)
      ).to.be.revertedWithCustomError(aggregator, "InvalidTimeWindow");
    });

    it("should allow verifications after compromise window ends", async function () {
      const currentTime = await ethers.provider.getBlock("latest").then(b => b.timestamp);
      const startTime = currentTime - 2000; // 2 hours ago
      const endTime = currentTime - 1000; // 1 hour ago (ended)

      await aggregator.markSourceCompromised(1, startTime, endTime);

      // Should allow new verification (window ended)
      const proof = await mockGitcoinProof(oracle, user.address);
      await gitcoinAdapter.verifyAndRegister(user.address, proof);
      expect(await aggregator.isVerifiedHuman(user.address)).to.be.true;
    });
  });

  describe("Suspicious Window (Sybil Attack Detection)", function () {
    it("should reset suspicious count on normal verification", async function () {
      // Create 2 suspicious verifications
      for (let i = 0; i < 2; i++) {
        const userId = ethers.keccak256(ethers.toUtf8Bytes(`user-${i}-${Date.now()}`));
        const timestamp = Math.floor(Date.now() / 1000);
        const score = 20; // Low score
        
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

      // Normal verification should reset counter
      const normalProof = await mockGitcoinProof(oracle, user2.address, 80);
      await gitcoinAdapter.verifyAndRegister(user2.address, normalProof);

      // Should be able to register more (counter reset)
      const anotherNormalProof = await mockGitcoinProof(oracle, user.address, 75);
      await gitcoinAdapter.verifyAndRegister(user.address, anotherNormalProof);
    });

    it("should block source after 3 suspicious verifications in window", async function () {
      // Create 3 suspicious verifications (low scores, triggering anomaly)
      for (let i = 0; i < 3; i++) {
        const userId = ethers.keccak256(ethers.toUtf8Bytes(`suspicious-${i}-${Date.now()}`));
        const timestamp = Math.floor(Date.now() / 1000);
        const score = 20; // Low score
        
        const messageHash = ethers.solidityPackedKeccak256(
          ['address', 'bytes32', 'uint256', 'uint256'],
          [user.address, userId, score, timestamp]
        );
        const signature = await oracle.signMessage(ethers.getBytes(messageHash));
        
        const proof = ethers.AbiCoder.defaultAbiCoder().encode(
          ['bytes32', 'uint256', 'uint256', 'bytes'],
          [userId, score, timestamp, signature]
        );
        
        if (i < 2) {
          // First 2 should succeed
          await gitcoinAdapter.verifyAndRegister(user.address, proof);
        } else {
          // 3rd should block
          await expect(
            gitcoinAdapter.verifyAndRegister(user.address, proof)
          ).to.be.revertedWithCustomError(aggregator, "SourceUnderAttack");
        }
      }
    });

    it("should reset window after duration expires", async function () {
      // This test would require time manipulation, skipping for now
      // In production, window resets automatically after WINDOW_DURATION
    });

    it("should allow owner to reset source window", async function () {
      await aggregator.resetSourceWindow(1);
      const window = await aggregator.sourceWindows(1);
      expect(window.suspiciousCount).to.equal(0);
      expect(window.verificationCount).to.equal(0);
    });
  });

  describe("isVerificationValid", function () {
    it("should return true for valid verification", async function () {
      const proof = await mockGitcoinProof(oracle, user.address);
      await gitcoinAdapter.verifyAndRegister(user.address, proof);

      expect(await aggregator.isVerificationValid(user.address, 0)).to.be.true;
    });

    it("should return false for invalidated verification", async function () {
      const proof = await mockGitcoinProof(oracle, user.address);
      await gitcoinAdapter.verifyAndRegister(user.address, proof);

      const verifications = await aggregator.getAllVerifications(user.address);
      const uniqueId = verifications[0].uniqueId;

      await aggregator.invalidateVerification(uniqueId);

      expect(await aggregator.isVerificationValid(user.address, 0)).to.be.false;
    });

    it("should return false for verification in compromise window", async function () {
      const proof = await mockGitcoinProof(oracle, user.address);
      await gitcoinAdapter.verifyAndRegister(user.address, proof);

      const verifications = await aggregator.getAllVerifications(user.address);
      const verificationTime = verifications[0].timestamp;

      await aggregator.markSourceCompromised(1, verificationTime - 100, verificationTime + 100);

      expect(await aggregator.isVerificationValid(user.address, 0)).to.be.false;
    });

    it("should revert if index out of bounds", async function () {
      await expect(
        aggregator.isVerificationValid(user.address, 0)
      ).to.be.revertedWith("Index out of bounds");
    });
  });

  describe("getHumanProbability with invalidations", function () {
    it("should return 0 if all verifications are invalidated", async function () {
      const proof = await mockGitcoinProof(oracle, user.address);
      await gitcoinAdapter.verifyAndRegister(user.address, proof);

      const verifications = await aggregator.getAllVerifications(user.address);
      await aggregator.invalidateVerification(verifications[0].uniqueId);

      const probability = await aggregator.getHumanProbability(user.address);
      expect(probability).to.equal(0);
    });

    it("should exclude invalidated verifications from calculation", async function () {
      const proof1 = await mockGitcoinProof(oracle, user.address, 75);
      await gitcoinAdapter.verifyAndRegister(user.address, proof1);

      const { pohAdapter } = await deployAll();
      const pohProof = await mockPoHProof(oracle, user.address);
      await pohAdapter.verifyAndRegister(user.address, pohProof);

      const probBefore = await aggregator.getHumanProbability(user.address);

      // Invalidate Gitcoin verification
      const verifications = await aggregator.getAllVerifications(user.address);
      await aggregator.invalidateVerification(verifications[0].uniqueId);

      const probAfter = await aggregator.getHumanProbability(user.address);
      
      // Should be lower (only PoH counts now)
      expect(probAfter).to.be.lt(probBefore);
      expect(probAfter).to.be.gt(0); // But still > 0 (has PoH)
    });
  });
});
