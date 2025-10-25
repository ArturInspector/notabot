import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployGitcoinAdapter: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  const mainAggregator = await get("MainAggregator");

  // Backend Oracle address (will sign Gitcoin proofs)
  // This should match the address in your backend/.env
  const backendOracleAddress = process.env.BACKEND_ORACLE_ADDRESS || deployer;

  await deploy("GitcoinAdapter", {
    from: deployer,
    args: [mainAggregator.address, backendOracleAddress],
    log: true,
    autoMine: true,
  });

  const gitcoinAdapter = await get("GitcoinAdapter");
  const { ethers } = hre;

  const aggregator = await ethers.getContractAt("MainAggregator", mainAggregator.address);

  const isAlreadyAdapter = await aggregator.isAdapter(gitcoinAdapter.address);
  if (!isAlreadyAdapter) {
    console.log("Adding GitcoinAdapter to MainAggregator...");
    await aggregator.addAdapter(gitcoinAdapter.address, 1); // sourceId = 1 for Gitcoin
    console.log("✅ GitcoinAdapter added!");
  } else {
    console.log("✅ GitcoinAdapter already registered");
  }
  console.log(`📝 Backend Oracle Address: ${backendOracleAddress}`);
};

export default deployGitcoinAdapter;

deployGitcoinAdapter.tags = ["GitcoinAdapter", "adapters"];
deployGitcoinAdapter.dependencies = ["MainAggregator"];
