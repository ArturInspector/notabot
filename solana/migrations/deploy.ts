import * as anchor from "@coral-xyz/anchor";

module.exports = async function (provider) {
  anchor.setProvider(provider);

  console.log("Deploying NotABot program to Devnet...");
  console.log("Program ID:", anchor.workspace.Notabot.programId.toString());
  console.log("Wallet:", provider.wallet.publicKey.toString());
  console.log("Deployment successful!");
};

