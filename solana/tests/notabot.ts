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

  it("fails with unique_id string too long", async () => {
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

    const longId = "b".repeat(70);

    try {
      await program.methods
        .verifyUser("worldcoin", longId)
        .accounts({
          verification: newPDA,
          authority: authority.publicKey,
          user: newUser.publicKey,
        })
        .rpc();
      
      assert.fail("Should have failed with unique_id too long");
    } catch (err) {
      assert.include(err.toString(), "UniqueIdTooLong");
    }
  });

  it("fails to initialize verification twice for same user", async () => {
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

    try {
      await program.methods
        .initializeVerification()
        .accounts({
          verification: newPDA,
          user: newUser.publicKey,
          payer: authority.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      
      assert.fail("Should have failed with account already exists");
    } catch (err) {
      assert.ok(err.toString().includes("already in use") || err.toString().includes("custom program error"));
    }
  });

  it("fails to verify non-existent PDA", async () => {
    const fakeUser = Keypair.generate();
    const [fakePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("verification"), fakeUser.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .verifyUser("brightid", "fake:id")
        .accounts({
          verification: fakePDA,
          authority: authority.publicKey,
          user: fakeUser.publicKey,
        })
        .rpc();
      
      assert.fail("Should have failed with account not found");
    } catch (err) {
      assert.ok(err.toString().includes("AccountNotInitialized") || err.toString().includes("Account does not exist"));
    }
  });

  it("checks is_verified returns false for unverified user", async () => {
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

    const isVerified = await program.methods
      .isVerified()
      .accounts({
        verification: newPDA,
        user: newUser.publicKey,
      })
      .view();

    assert.equal(isVerified, false);
  });

  it("verifies with maximum length strings", async () => {
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

    const maxSource = "a".repeat(32);
    const maxUniqueId = "b".repeat(64);

    await program.methods
      .verifyUser(maxSource, maxUniqueId)
      .accounts({
        verification: newPDA,
        authority: authority.publicKey,
        user: newUser.publicKey,
      })
      .rpc();

    const verification = await program.account.userVerification.fetch(newPDA);
    assert.equal(verification.source, maxSource);
    assert.equal(verification.uniqueId, maxUniqueId);
    assert.equal(verification.isVerified, true);
  });

  it("measures compute units for initialize_verification", async () => {
    const newUser = Keypair.generate();
    const [newPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("verification"), newUser.publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .initializeVerification()
      .accounts({
        verification: newPDA,
        user: newUser.publicKey,
        payer: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const txDetails = await provider.connection.getTransaction(tx, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    const computeUnits = txDetails?.meta?.computeUnitsConsumed || 0;
    console.log(`    Compute units: ${computeUnits}`);
    assert.ok(computeUnits < 200000, `Compute units ${computeUnits} exceeded 200k limit`);
  });

  it("measures compute units for verify_user", async () => {
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

    const tx = await program.methods
      .verifyUser("poh", "0x1234")
      .accounts({
        verification: newPDA,
        authority: authority.publicKey,
        user: newUser.publicKey,
      })
      .rpc();

    const txDetails = await provider.connection.getTransaction(tx, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    const computeUnits = txDetails?.meta?.computeUnitsConsumed || 0;
    console.log(`    Compute units: ${computeUnits}`);
    assert.ok(computeUnits < 200000, `Compute units ${computeUnits} exceeded 200k limit`);
  });

  it("validates PDA derivation matches expected", async () => {
    const testUser = Keypair.generate();
    const [expectedPDA, expectedBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("verification"), testUser.publicKey.toBuffer()],
      program.programId
    );

    const [actualPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("verification"), testUser.publicKey.toBuffer()],
      program.programId
    );

    assert.equal(expectedPDA.toBase58(), actualPDA.toBase58());

    await program.methods
      .initializeVerification()
      .accounts({
        verification: actualPDA,
        user: testUser.publicKey,
        payer: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const verification = await program.account.userVerification.fetch(actualPDA);
    assert.equal(verification.bump, expectedBump);
  });

  it("verifies account is owned by program", async () => {
    const accountInfo = await provider.connection.getAccountInfo(verificationPDA);
    
    assert.ok(accountInfo !== null, "Account should exist");
    assert.equal(
      accountInfo.owner.toBase58(),
      program.programId.toBase58(),
      "Account should be owned by program"
    );
  });

  it("verifies account data size matches expected", async () => {
    const accountInfo = await provider.connection.getAccountInfo(verificationPDA);
    
    const expectedSize = 8 + 32 + 1 + 4 + 32 + 4 + 64 + 8 + 8 + 1;
    
    assert.equal(
      accountInfo?.data.length,
      expectedSize,
      `Account size should be ${expectedSize} bytes`
    );
  });
});

