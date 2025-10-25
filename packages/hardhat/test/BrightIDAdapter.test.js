const { expect } = require("chai");
const { ethers } = require("hardhat");
const { deployAll, mockBrightIDProof } = require("./helpers");

describe("BrightIDAdapter", function () {
  let aggregator, brightidAdapter, user, oracle;

  beforeEach(async function () {
    ({ aggregator, brightidAdapter, user, oracle } = await deployAll());
  });

  describe("verifyAndRegister", function () {
    it("should verify valid signature", async function () {
      const proof = await mockBrightIDProof(oracle, user.address);
      await expect(brightidAdapter.verifyAndRegister(user.address, proof)).to.emit(brightidAdapter, "BrightIDVerified");
    });

    it("should revert on invalid signature", async function () {
      const [, , , wrongUser] = await ethers.getSigners();
      const proof = await mockBrightIDProof(oracle, user.address);
      
      // Try to use proof from different user - signature won't match
      await expect(brightidAdapter.verifyAndRegister(wrongUser.address, proof)).to.be.revertedWithCustomError(
        brightidAdapter,
        "InvalidSignature",
      );
    });

    it("should revert on expired proof", async function () {
      const contextId = ethers.keccak256(ethers.toUtf8Bytes(`brightid-${user.address}`));
      const timestamp = Math.floor(Date.now() / 1000) - 7200;

      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "bytes32", "uint256"],
        [user.address, contextId, timestamp],
      );

      const signature = await oracle.signMessage(ethers.getBytes(messageHash));

      const proof = ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "uint256", "bytes"],
        [contextId, timestamp, signature],
      );

      await expect(brightidAdapter.verifyAndRegister(user.address, proof)).to.be.revertedWithCustomError(
        brightidAdapter,
        "ProofExpired",
      );
    });

    it("should revert on duplicate contextId", async function () {
      const proof = await mockBrightIDProof(oracle, user.address);

      await brightidAdapter.verifyAndRegister(user.address, proof);

      await expect(brightidAdapter.verifyAndRegister(user.address, proof)).to.be.revertedWithCustomError(
        brightidAdapter,
        "ProofAlreadyUsed",
      );
    });
  });

  describe("getSourceId", function () {
    it("should return correct source ID", async function () {
      expect(await brightidAdapter.getSourceId()).to.equal(3);
    });
  });
});

