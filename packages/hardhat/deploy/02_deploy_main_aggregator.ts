import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMainAggregator: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  const verificationToken = await get("VerificationToken");
  const verificationSBT = await get("VerificationSBT");
  const treasuryAddress = deployer;

  await deploy("MainAggregator", {
    from: deployer,
    args: [verificationToken.address, verificationSBT.address, treasuryAddress],
    log: true,
    autoMine: true,
  });

  const mainAggregator = await get("MainAggregator");
  const { ethers } = hre;

  const tokenContract = await ethers.getContractAt("VerificationToken", verificationToken.address);
  const sbtContract = await ethers.getContractAt("VerificationSBT", verificationSBT.address);

  const MINTER_ROLE = await tokenContract.MINTER_ROLE();

  console.log("Granting MINTER_ROLE to MainAggregator...");
  await tokenContract.grantRole(MINTER_ROLE, mainAggregator.address);
  await sbtContract.grantRole(MINTER_ROLE, mainAggregator.address);
  console.log("min ter granted!");
};

export default deployMainAggregator;

deployMainAggregator.tags = ["MainAggregator", "core"];
deployMainAggregator.dependencies = ["VerificationToken", "VerificationSBT"];
