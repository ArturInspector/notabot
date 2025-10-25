import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployVerificationToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  await deploy("VerificationToken", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
};

export default deployVerificationToken;

deployVerificationToken.tags = ["VerificationToken", "core"];
