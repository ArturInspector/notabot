import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Notabot } from "../target/types/notabot";
import { PublicKey, Keypair } from "@solana/web3.js";
import { assert } from "chai";

describe("notabot", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Notabot as Program<Notabot>;
  
  const user = Keypair.generate();
  const authority = provider.wallet;
  
  let verificationPDA: PublicKey;
  let verificationBump: number;

  before(async () => {
    [verificationPDA, verificationBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("verification"), user.publicKey.toBuffer()],
      program.programId
    );

    const airdropTx = await provider.connection.requestAirdrop(
      user.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropTx);
  });

  it("initializes verification PDA", async () => {
    await program.methods
      .initializeVerification()
      .accounts({
        verification: verificationPDA,
        user: user.publicKey,
        payer: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const verification = await program.account.userVerification.fetch(verificationPDA);
    
    assert.equal(verification.user.toBase58(), user.publicKey.toBase58());
    assert.equal(verification.isVerified, false);
    assert.equal(verification.trustScore.toNumber(), 0);
    assert.equal(verification.bump, verificationBump);
  });

  it("verifies user with oracle authority", async () => {
    const source = "gitcoin";
    const uniqueId = "passport:0x123abc";

    await program.methods
      .verifyUser(source, uniqueId)
      .accounts({
        verification: verificationPDA,
        authority: authority.publicKey,
        user: user.publicKey,
      })
      .rpc();

    const verification = await program.account.userVerification.fetch(verificationPDA);
    
    assert.equal(verification.isVerified, true);
    assert.equal(verification.source, source);
    assert.equal(verification.uniqueId, uniqueId);
    assert.equal(verification.trustScore.toNumber(), 100);
  });

  it("checks if user is verified", async () => {
    const isVerified = await program.methods
      .isVerified()
      .accounts({
        verification: verificationPDA,
        user: user.publicKey,
      })
      .view();

    assert.equal(isVerified, true);
  });

  it("gets user trust score", async () => {
    const trustScore = await program.methods
      .getTrustScore()
      .accounts({
        verification: verificationPDA,
        user: user.publicKey,
      })
      .view();

    assert.equal(trustScore.toNumber(), 100);
  });

  it("fails to verify with unauthorized authority", async () => {
    const fakeAuthority = Keypair.generate();
    const airdropTx = await provider.connection.requestAirdrop(
      fakeAuthority.publicKey,
      anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropTx);

    try {
      await program.methods
        .verifyUser("fake", "fake:id")
        .accounts({
          verification: verificationPDA,
          authority: fakeAuthority.publicKey,
          user: user.publicKey,
        })
        .signers([fakeAuthority])
        .rpc();
      
      assert.fail("Should have failed with unauthorized authority");
    } catch (err) {
      assert.include(err.toString(), "Unauthorized");
    }
  });

  it("fails with source string too long", async () => {
    const newUser = Keypair.generate();
    const [newPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("verification"), newUser.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .initializeVerification()
      .accounts({
        verification: newPDA,
        user: newUser.publicKey,
        payer: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const longSource = "a".repeat(50);

    try {
      await program.methods
        .verifyUser(longSource, "id")
        .accounts({
          verification: newPDA,
          authority: authority.publicKey,
          user: newUser.publicKey,
        })
        .rpc();
      
      assert.fail("Should have failed with source too long");
    } catch (err) {
      assert.include(err.toString(), "SourceTooLong");
    }
  });
});

