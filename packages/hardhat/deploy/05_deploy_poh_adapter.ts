import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployPoHAdapter: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  const mainAggregator = await get("MainAggregator");

  const backendOracleAddress = process.env.BACKEND_ORACLE_ADDRESS || deployer;

  await deploy("PoHAdapter", {
    from: deployer,
    args: [mainAggregator.address, backendOracleAddress],
    log: true,
    autoMine: true,
  });

  const pohAdapter = await get("PoHAdapter");
  const { ethers } = hre;

  const aggregator = await ethers.getContractAt(
    "MainAggregator",
    mainAggregator.address,
  );

  const isAlreadyAdapter = await aggregator.isAdapter(pohAdapter.address);
  if (!isAlreadyAdapter) {
    console.log("Adding PoHAdapter to MainAggregator...");
    await aggregator.addAdapter(pohAdapter.address, 2); // sourceId = 2 for PoH
    console.log("✅ PoHAdapter added!");
  } else {
    console.log("✅ PoHAdapter already registered");
  }
  console.log(`📝 Backend Oracle Address: ${backendOracleAddress}`);
};

export default deployPoHAdapter;

deployPoHAdapter.tags = ["PoHAdapter", "adapters"];
deployPoHAdapter.dependencies = ["MainAggregator"];
