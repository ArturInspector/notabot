import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { parseEther } from "ethers";

const deployMainAggregator: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  const verificationToken = await get("VerificationToken");

  await deploy("MainAggregator", {
    from: deployer,
    args: [verificationToken.address],
    log: true,
    autoMine: true,
  });

  const mainAggregator = await get("MainAggregator");
  const { ethers } = hre;

  const tokenContract = await ethers.getContractAt("VerificationToken", verificationToken.address);

  // Transfer 500k tokens to MainAggregator for rewards (50% of supply)
  const transferAmount = parseEther("500000");
  console.log("Transferring 500k HMT to MainAggregator for rewards...");
  await tokenContract.transfer(mainAggregator.address, transferAmount);
  console.log("✅ MainAggregator funded with tokens!");
};

export default deployMainAggregator;

deployMainAggregator.tags = ["MainAggregator", "core"];
deployMainAggregator.dependencies = ["VerificationToken"];
