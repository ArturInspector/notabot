# NotABot Solana Program

Universal Proof-of-Humanity Protocol - Solana Integration

## Quick Start

### Prerequisites
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.29.0
avm use 0.29.0
solana-keygen new
```

### Build & Test
```bash
anchor build
anchor test
```

### Deploy to Devnet
```bash
anchor deploy --provider.cluster devnet
```

## Program Structure

```
programs/notabot/src/
├── lib.rs                      # Entry point
├── instructions/
│   ├── initialize_verification.rs  # Create PDA for user
│   ├── verify_user.rs              # Oracle writes verification
│   ├── is_verified.rs              # Read verification status
│   └── get_trust_score.rs          # Read trust score
├── state/
│   └── user_verification.rs        # Account structure
└── errors.rs                       # Custom errors
```

## Instructions

### 1. Initialize Verification
Creates PDA for user (one-time, ~0.002 SOL rent)

### 2. Verify User
Backend oracle calls with proof from Gitcoin/BrightID

### 3. Check Verification
Anyone can read verification status (permissionless)

## Integration Example

```typescript
import { Program, AnchorProvider } from '@coral-xyz/anchor';

const [verificationPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from('verification'), userPubkey.toBuffer()],
  programId
);

const verification = await program.account.userVerification.fetch(verificationPDA);
console.log('Verified:', verification.isVerified);
console.log('Trust Score:', verification.trustScore);
```

## Security

- **ORACLE_AUTHORITY**: Backend Ed25519 keypair (update in `verify_user.rs`)
- **PDA Security**: Only program can modify verification data
- **Compute Budget**: <200k CU per instruction
