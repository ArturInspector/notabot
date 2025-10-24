const { ethers } = require("hardhat");

async function deployAll() {
  const [owner, user, user2, oracle] = await ethers.getSigners();
  
  const Token = await ethers.getContractFactory("VerificationToken");
  const token = await Token.deploy(owner.address);
  
  const SBT = await ethers.getContractFactory("VerificationSBT");
  const sbt = await SBT.deploy(owner.address);
  
  const Aggregator = await ethers.getContractFactory("MainAggregator");
  const aggregator = await Aggregator.deploy(token.address, sbt.address);
  
  const MINTER_ROLE = await token.MINTER_ROLE();
  await token.grantRole(MINTER_ROLE, aggregator.address);
  await sbt.grantRole(MINTER_ROLE, aggregator.address);
  
  const GitcoinAdapter = await ethers.getContractFactory("GitcoinAdapter");
  const gitcoinAdapter = await GitcoinAdapter.deploy(aggregator.address, oracle.address);
  
  await aggregator.addAdapter(gitcoinAdapter.address, 1);
  
  return { 
    aggregator, 
    token, 
    sbt, 
    gitcoinAdapter,
    owner, 
    user, 
    user2, 
    oracle 
  };
}

function mockGitcoinProof(oracle, userAddress, score = 75) {
  const userId = ethers.keccak256(ethers.toUtf8Bytes(userAddress));
  const timestamp = Math.floor(Date.now() / 1000);
  
  const messageHash = ethers.solidityPackedKeccak256(
    ['address', 'bytes32', 'uint256', 'uint256'],
    [userAddress, userId, score, timestamp]
  );
  
  const signature = oracle.signMessage(ethers.getBytes(messageHash));
  
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ['bytes32', 'uint256', 'uint256', 'bytes'],
    [userId, score, timestamp, signature]
  );
}

module.exports = { deployAll, mockGitcoinProof };

