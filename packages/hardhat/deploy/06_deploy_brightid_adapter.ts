import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployBrightIDAdapter: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  const mainAggregator = await get("MainAggregator");
  const backendOracleAddress = process.env.BACKEND_ORACLE_ADDRESS || deployer;

  await deploy("BrightIDAdapter", {
    from: deployer,
    args: [mainAggregator.address, backendOracleAddress],
    log: true,
    autoMine: true,
  });

  const brightidAdapter = await get("BrightIDAdapter");
  const { ethers } = hre;

  const aggregator = await ethers.getContractAt("MainAggregator", mainAggregator.address);

  const isAlreadyAdapter = await aggregator.isAdapter(brightidAdapter.address);
  if (!isAlreadyAdapter) {
    console.log("Adding BrightIDAdapter to MainAggregator...");
    await aggregator.addAdapter(brightidAdapter.address, 3); // sourceId = 3 for BrightID
    console.log("✅ BrightIDAdapter added!");
  } else {
    console.log("✅ BrightIDAdapter already registered");
  }
  console.log(`📝 Backend Oracle Address: ${backendOracleAddress}`);
};

export default deployBrightIDAdapter;

deployBrightIDAdapter.tags = ["BrightIDAdapter", "adapters"];
deployBrightIDAdapter.dependencies = ["MainAggregator"];

