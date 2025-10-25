import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployWorldcoinAdapter: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  const mainAggregator = await get("MainAggregator");

  const worldIdAddress = "0x469449f251692e0779667583026b5a1e99512157";
  const appId = "app_staging_your_app_id"; // Replace with your actual app ID
  const action = "verify-human";

  await deploy("WorldcoinAdapter", {
    from: deployer,
    args: [worldIdAddress, mainAggregator.address, appId, action],
    log: true,
    autoMine: true,
  });

  const worldcoinAdapter = await get("WorldcoinAdapter");
  const { ethers } = hre;

  const aggregator = await ethers.getContractAt("MainAggregator", mainAggregator.address);

  const isAlreadyAdapter = await aggregator.isAdapter(worldcoinAdapter.address);
  if (!isAlreadyAdapter) {
    console.log("Adding WorldcoinAdapter to MainAggregator...");
    await aggregator.addAdapter(worldcoinAdapter.address, 0); // sourceId = 0 for Worldcoin
    console.log("✅ WorldcoinAdapter added!");
  } else {
    console.log("✅ WorldcoinAdapter already registered");
  }
};

export default deployWorldcoinAdapter;

deployWorldcoinAdapter.tags = ["WorldcoinAdapter", "adapters"];
deployWorldcoinAdapter.dependencies = ["MainAggregator"];
