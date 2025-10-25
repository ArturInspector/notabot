const { ethers } = require("hardhat");

async function deployAll() {
  const [owner, user, user2, oracle] = await ethers.getSigners();
  
  const Token = await ethers.getContractFactory("VerificationToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  
  const Aggregator = await ethers.getContractFactory("MainAggregator");
  const aggregator = await Aggregator.deploy(await token.getAddress());
  await aggregator.waitForDeployment();
  
  // Transfer 500k tokens to aggregator for rewards
  await token.transfer(await aggregator.getAddress(), ethers.parseEther("500000"));
  
  const GitcoinAdapter = await ethers.getContractFactory("GitcoinAdapter");
  const gitcoinAdapter = await GitcoinAdapter.deploy(await aggregator.getAddress(), oracle.address);
  await gitcoinAdapter.waitForDeployment();
  
  await aggregator.addAdapter(await gitcoinAdapter.getAddress(), 1);
  
  return { 
    aggregator, 
    token, 
    gitcoinAdapter,
    owner, 
    user, 
    user2, 
    oracle 
  };
}

async function mockGitcoinProof(oracle, userAddress, score = 75) {
  const userId = ethers.keccak256(ethers.toUtf8Bytes(userAddress));
  const timestamp = Math.floor(Date.now() / 1000);
  
  // Pack message exactly as in contract
  const messageHash = ethers.solidityPackedKeccak256(
    ['address', 'bytes32', 'uint256', 'uint256'],
    [userAddress, userId, score, timestamp]
  );
  
  // Convert to bytes array for signMessage (it will add Ethereum prefix automatically)
  const messageHashBytes = ethers.getBytes(messageHash);
  const signature = await oracle.signMessage(messageHashBytes);
  
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ['bytes32', 'uint256', 'uint256', 'bytes'],
    [userId, score, timestamp, signature]
  );
}

module.exports = { deployAll, mockGitcoinProof };

