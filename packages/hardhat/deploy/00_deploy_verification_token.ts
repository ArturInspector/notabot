import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployVerificationToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("VerificationToken", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("✅ VerificationToken deployed with 1M HMT supply");
};

export default deployVerificationToken;

deployVerificationToken.tags = ["VerificationToken", "core"];
