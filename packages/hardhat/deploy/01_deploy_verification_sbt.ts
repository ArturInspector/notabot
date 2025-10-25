import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployVerificationSBT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  await deploy("VerificationSBT", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
};

export default deployVerificationSBT;

deployVerificationSBT.tags = ["VerificationSBT", "core"];
