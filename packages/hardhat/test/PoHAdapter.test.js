const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployAll, mockPoHProof } = require("./helpers");

describe("PoHAdapter", function () {
  let aggregator, pohAdapter, user, oracle;

  beforeEach(async function () {
    ({ aggregator, pohAdapter, user, oracle } = await deployAll());
  });

  describe("verifyAndRegister", function () {
    it("should verify valid signature", async function () {
      const proof = await mockPoHProof(oracle, user.address);
      await expect(pohAdapter.verifyAndRegister(user.address, proof)).to.emit(pohAdapter, "PoHVerified");
    });

    it("should revert on invalid signature", async function () {
      const [, , , wrongUser] = await ethers.getSigners();
      const proof = await mockPoHProof(oracle, user.address);
      
      // Try to use proof from different user - signature won't match
      await expect(pohAdapter.verifyAndRegister(wrongUser.address, proof)).to.be.revertedWithCustomError(
        pohAdapter,
        "InvalidSignature",
      );
    });

    it("should revert on expired proof", async function () {
      const pohId = ethers.keccak256(ethers.toUtf8Bytes(`poh-${user.address}`));
      const timestamp = Math.floor(Date.now() / 1000) - 7200;

      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "bytes32", "uint256"],
        [user.address, pohId, timestamp],
      );

      const signature = await oracle.signMessage(ethers.getBytes(messageHash));

      const proof = ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "uint256", "bytes"],
        [pohId, timestamp, signature],
      );

      await expect(pohAdapter.verifyAndRegister(user.address, proof)).to.be.revertedWithCustomError(
        pohAdapter,
        "ProofExpired",
      );
    });

    it("should revert on duplicate pohId", async function () {
      const proof = await mockPoHProof(oracle, user.address);

      await pohAdapter.verifyAndRegister(user.address, proof);

      await expect(pohAdapter.verifyAndRegister(user.address, proof)).to.be.revertedWithCustomError(
        pohAdapter,
        "ProofAlreadyUsed",
      );
    });
  });

  describe("getSourceId", function () {
    it("should return correct source ID", async function () {
      expect(await pohAdapter.getSourceId()).to.equal(2);
    });
  });
});

