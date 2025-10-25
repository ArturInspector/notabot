const { ethers } = require("hardhat");

async function deployAll() {
  const [owner, user, user2, oracle] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("VerificationToken");
  const token = await Token.deploy(owner.address);
  await token.waitForDeployment();

  const SBT = await ethers.getContractFactory("VerificationSBT");
  const sbt = await SBT.deploy(owner.address);
  await sbt.waitForDeployment();

  const Aggregator = await ethers.getContractFactory("MainAggregator");
  const aggregator = await Aggregator.deploy(await token.getAddress(), await sbt.getAddress(), owner.address);
  await aggregator.waitForDeployment();

  const MINTER_ROLE = await token.MINTER_ROLE();
  await token.grantRole(MINTER_ROLE, await aggregator.getAddress());
  await sbt.grantRole(MINTER_ROLE, await aggregator.getAddress());

  const GitcoinAdapter = await ethers.getContractFactory("GitcoinAdapter");
  const gitcoinAdapter = await GitcoinAdapter.deploy(await aggregator.getAddress(), oracle.address);
  await gitcoinAdapter.waitForDeployment();

  await aggregator.addAdapter(await gitcoinAdapter.getAddress(), 1);

  return {
    aggregator,
    token,
    sbt,
    gitcoinAdapter,
    owner,
    user,
    user2,
    oracle,
  };
}

async function mockGitcoinProof(oracle, userAddress, score = 75) {
  const userId = ethers.keccak256(ethers.toUtf8Bytes(userAddress));
  const timestamp = Math.floor(Date.now() / 1000);

  const messageHash = ethers.solidityPackedKeccak256(
    ["address", "bytes32", "uint256", "uint256"],
    [userAddress, userId, score, timestamp],
  );

  const signature = await oracle.signMessage(ethers.getBytes(messageHash));

  return ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes32", "uint256", "uint256", "bytes"],
    [userId, score, timestamp, signature],
  );
}

module.exports = { deployAll, mockGitcoinProof };
