# NotABot Solana Program

**Universal Proof-of-Humanity Protocol on Solana**

## Quick Start

### Prerequisites
- Rust 1.70+
- Solana CLI 1.17+
- Anchor 0.29+
- Node.js 20+

### Installation

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Install dependencies
cd packages/solana
npm install
```

### Build

```bash
anchor build
```

### Test

```bash
anchor test
```

### Deploy

```bash
# Devnet
anchor deploy --provider.cluster devnet

# Testnet
anchor deploy --provider.cluster testnet

# Mainnet (after audit!)
anchor deploy --provider.cluster mainnet-beta
```

---

## Program Instructions

### `initialize_verification`
Create verification PDA for new user.

### `verify_user` 
Record verification (oracle only).

### `is_verified`
Check if user is verified (read-only).

### `get_trust_score`
Get user's aggregate trust score.

---

## Integration Example

```typescript
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

const program = new Program(IDL, programId, provider);

// Check if user is verified
const [verificationPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from('verification'), userPubkey.toBuffer()],
  programId
);

const verification = await program.account.userVerification.fetch(verificationPDA);
console.log('Is verified:', verification.isVerified);
```

---

## Documentation

- [Architecture](./ARCHITECTURE.md) - Full technical design
- [API Reference](./docs/API.md) - Instruction details
- [Integration Guide](../../docs/INTEGRATION.md) - How to integrate

---

## Status

- ✅ Architecture designed
- 🚧 Program implementation (in progress)
- 🚧 Tests
- ⏳ Devnet deployment
- ⏳ Audit

---

**Part of NotABot Protocol**  
Multi-chain identity verification for Web3

