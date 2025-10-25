const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployAll, mockGitcoinProof } = require("./helpers");

describe("GitcoinAdapter", function () {
  let aggregator, gitcoinAdapter, user, oracle;

  beforeEach(async function () {
    ({ aggregator, gitcoinAdapter, user, oracle } = await deployAll());
  });

  describe("verifyAndRegister", function () {
    it("should verify valid signature", async function () {
      const proof = await mockGitcoinProof(oracle, user.address, 75);

      await expect(gitcoinAdapter.verifyAndRegister(user.address, proof)).to.emit(gitcoinAdapter, "GitcoinVerified");
    });

    it("should revert on invalid signature", async function () {
      const [, , , wrongOracle] = await ethers.getSigners();
      const proof = await mockGitcoinProof(wrongOracle, user.address, 75);

      await expect(gitcoinAdapter.verifyAndRegister(user.address, proof)).to.be.revertedWithCustomError(
        gitcoinAdapter,
        "InvalidSignature",
      );
    });

    it("should revert on low score", async function () {
      const proof = await mockGitcoinProof(oracle, user.address, 10);

      await expect(gitcoinAdapter.verifyAndRegister(user.address, proof)).to.be.revertedWithCustomError(
        gitcoinAdapter,
        "ScoreTooLow",
      );
    });

    it("should revert on expired proof", async function () {
      const userId = ethers.keccak256(ethers.toUtf8Bytes(user.address));
      const score = 75;
      const timestamp = Math.floor(Date.now() / 1000) - 7200;

      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "bytes32", "uint256", "uint256"],
        [user.address, userId, score, timestamp],
      );

      const signature = await oracle.signMessage(ethers.getBytes(messageHash));

      const proof = ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "uint256", "uint256", "bytes"],
        [userId, score, timestamp, signature],
      );

      await expect(gitcoinAdapter.verifyAndRegister(user.address, proof)).to.be.revertedWithCustomError(
        gitcoinAdapter,
        "ProofExpired",
      );
    });

    it("should revert on duplicate userId", async function () {
      const proof = await mockGitcoinProof(oracle, user.address);

      await gitcoinAdapter.verifyAndRegister(user.address, proof);

      await expect(gitcoinAdapter.verifyAndRegister(user.address, proof)).to.be.revertedWithCustomError(
        gitcoinAdapter,
        "ProofAlreadyUsed",
      );
    });
  });

  describe("getSourceId", function () {
    it("should return correct source ID", async function () {
      expect(await gitcoinAdapter.getSourceId()).to.equal(1);
    });
  });
});
