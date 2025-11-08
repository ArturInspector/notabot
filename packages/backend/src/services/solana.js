import { Connection, Keypair, PublicKey, Transaction, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import anchor from '@coral-xyz/anchor';
const { BN, Program, AnchorProvider, web3 } = anchor;
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import bs58 from 'bs58';

const PROGRAM_ID = new PublicKey(config.SOLANA_PROGRAM_ID);

class SolanaService {
  constructor() {
    this.connection = new Connection(
      config.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000
      }
    );

    if (config.SOLANA_ORACLE_PRIVATE_KEY) {
      this.oracleKeypair = Keypair.fromSecretKey(
        bs58.decode(config.SOLANA_ORACLE_PRIVATE_KEY)
      );
      logger.info('Solana Oracle initialized', {
        publicKey: this.oracleKeypair.publicKey.toBase58()
      });
    } else {
      logger.warn('SOLANA_ORACLE_PRIVATE_KEY not set - read-only mode');
    }
  }

  getOraclePublicKey() {
    return this.oracleKeypair?.publicKey.toBase58() || null;
  }

  async getVerificationPDA(userPublicKey) {
    const userPubkey = new PublicKey(userPublicKey);
    const [pda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from('verification'), userPubkey.toBuffer()],
      PROGRAM_ID
    );
    return { pda, bump };
  }

  async checkVerificationExists(userPublicKey) {
    try {
      const { pda } = await this.getVerificationPDA(userPublicKey);
      const accountInfo = await this.connection.getAccountInfo(pda);
      return accountInfo !== null;
    } catch (error) {
      logger.error('Error checking verification PDA', { error: error.message });
      return false;
    }
  }

  async getVerificationData(userPublicKey) {
    try {
      const { pda } = await this.getVerificationPDA(userPublicKey);
      const accountInfo = await this.connection.getAccountInfo(pda);
      
      if (!accountInfo) {
        return null;
      }

      const data = accountInfo.data;
      
      const isVerified = data.readUInt8(40) === 1;
      const timestamp = data.readBigInt64LE(120);
      const trustScore = data.readBigUInt64LE(128);

      return {
        user: userPublicKey,
        isVerified,
        timestamp: Number(timestamp),
        trustScore: Number(trustScore)
      };
    } catch (error) {
      logger.error('Error reading verification data', { error: error.message });
      return null;
    }
  }

  async initializeVerification(userPublicKey, payerKeypair = this.oracleKeypair) {
    try {
      const userPubkey = new PublicKey(userPublicKey);
      const { pda } = await this.getVerificationPDA(userPublicKey);

      const exists = await this.checkVerificationExists(userPublicKey);
      if (exists) {
        logger.info('Verification PDA already exists', { userPublicKey });
        return { success: true, pda: pda.toBase58(), alreadyExists: true };
      }

      logger.info('Creating verification PDA', { userPublicKey, pda: pda.toBase58() });

      const initIx = new TransactionInstruction({
        keys: [
          { pubkey: pda, isSigner: false, isWritable: true },
          { pubkey: userPubkey, isSigner: false, isWritable: false },
          { pubkey: payerKeypair.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        programId: PROGRAM_ID,
        data: Buffer.from([0xaf, 0xaf, 0x6d, 0x1f, 0x0d, 0x98, 0x9b, 0xed])
      });

      const tx = new Transaction().add(initIx);
      tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
      tx.feePayer = payerKeypair.publicKey;

      const signature = await this.connection.sendTransaction(tx, [payerKeypair], {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });

      await this.connection.confirmTransaction(signature, 'confirmed');

      logger.info('Verification PDA initialized', { signature, pda: pda.toBase58() });

      return { success: true, signature, pda: pda.toBase58() };
    } catch (error) {
      logger.error('Failed to initialize verification', { error: error.message });
      throw error;
    }
  }

  async verifyUser(userPublicKey, source, uniqueId) {
    try {
      if (!this.oracleKeypair) {
        throw new Error('Oracle keypair not configured');
      }

      const userPubkey = new PublicKey(userPublicKey);
      const { pda } = await this.getVerificationPDA(userPublicKey);

      const exists = await this.checkVerificationExists(userPublicKey);
      if (!exists) {
        logger.info('PDA not found, initializing first');
        await this.initializeVerification(userPublicKey);
      }

      logger.info('Verifying user on Solana', { userPublicKey, source });

      const sourceBytes = Buffer.from(source.slice(0, 32));
      const uniqueIdBytes = Buffer.from(uniqueId.slice(0, 64));
      
      const instructionData = Buffer.concat([
        Buffer.from([0x6d, 0x08, 0x4b, 0x6c, 0x88, 0x9e, 0x3c, 0x6b]),
        Buffer.from([sourceBytes.length, 0, 0, 0]),
        sourceBytes,
        Buffer.from([uniqueIdBytes.length, 0, 0, 0]),
        uniqueIdBytes
      ]);

      const verifyIx = new TransactionInstruction({
        keys: [
          { pubkey: pda, isSigner: false, isWritable: true },
          { pubkey: this.oracleKeypair.publicKey, isSigner: true, isWritable: false },
          { pubkey: userPubkey, isSigner: false, isWritable: false }
        ],
        programId: PROGRAM_ID,
        data: instructionData
      });

      const tx = new Transaction().add(verifyIx);
      tx.recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
      tx.feePayer = this.oracleKeypair.publicKey;

      const signature = await this.connection.sendTransaction(tx, [this.oracleKeypair], {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });

      await this.connection.confirmTransaction(signature, 'confirmed');

      logger.info('User verified on Solana', { signature, userPublicKey });

      return {
        success: true,
        signature,
        pda: pda.toBase58(),
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      };
    } catch (error) {
      logger.error('Failed to verify user', { error: error.message });
      throw error;
    }
  }
}

export const solanaService = new SolanaService();

