# NotABot Solana Architecture
**Universal Proof-of-Humanity Protocol - Solana Integration**

---

## 🎯 Why Solana?

**The Sybil Problem Paradox:**
- Solana tx cost: ~$0.00025 (vs $0.01 on Base L2)
- Creating 10k fake wallets: ~$2.50 (vs $20,000 on Ethereum)
- **Result:** Best UX + Worst Sybil problem = MOST NEEDED HERE


## 🏗️ Program Architecture

### Core Components
е
**Program ID:** `notabot.so` (deployed on Devnet/Mainnet-Beta)

```solana/
│
├── programs/                        # 🔴 ON-CHAIN CODE (Rust)
│   └── notabot/
│       ├── src/
│       │   ├── lib.rs              # Entry point программы
│       │   │                       # Содержит: #[program] mod notabot {}
│       │   │
│       │   ├── instructions/       # 🔴 Instructions (выполняются ON-CHAIN)
│       │   │   ├── mod.rs          # Re-exports всех instructions
│       │   │   ├── initialize.rs   # Instruction: создать PDA
│       │   │   ├── verify_user.rs  # Instruction: записать verification
│       │   │   └── is_verified.rs  # Instruction: проверить verification
│       │   │
│       │   ├── state/              # 🔴 State structures (ON-CHAIN data)
│       │   │   ├── mod.rs
│       │   │   ├── user_verification.rs   # #[account] struct
│       │   │   └── oracle_authority.rs    # #[account] struct
│       │   │
│       │   └── errors.rs           # 🔴 Custom errors (ON-CHAIN)
│       │
│       └── Cargo.toml              # Rust dependencies
│
├── tests/                          # 🟢 OFF-CHAIN CODE (TypeScript)
│   └── notabot.ts                  # Integration tests
│                                   # Вызывает instructions, проверяет результаты
│
├── migrations/                     # 🟢 OFF-CHAIN (Deployment scripts)
│   └── deploy.ts
│
├── target/                         # Build artifacts (автогенерация!)
│   ├── deploy/
│   │   └── notabot.so             # 🔴 Compiled program (ON-CHAIN bytecode)
│   │
│   ├── idl/
│   │   └── notabot.json           # 🟢 Interface Description Language
│   │                              # Описание всех instructions + accounts
│   │                              # Используется client-side
│   │
│   └── types/
│       └── notabot.ts             # 🟢 Generated TypeScript types
│                                  # Используется client-side
│
├── app/                            # 🟢 OFF-CHAIN (Frontend, опционально)
│   ├── src/
│   │   ├── components/
│   │   │   └── VerificationButton.tsx
│   │   ├── hooks/
│   │   │   └── useVerification.ts
│   │   └── utils/
│   │       └── solana-client.ts   # Wrapper для вызовов program
│   └── package.json
│
├── Anchor.toml                     # 🟢 Config (где deploy, какой cluster)
├── Cargo.toml                      # Rust workspace config
└── package.json                    # Node.js dependencies
```

---

## 🔐 Security Model

### Authority Pattern
Backend holds Ed25519 keypair with authority to call `verify_user()`:

```rust
#[derive(Accounts)]
pub struct VerifyUser<'info> {
    #[account(
        mut,
        seeds = [b"verification", user.key().as_ref()],
        bump = verification.bump
    )]
    pub verification: Account<'info, UserVerification>,
    
    #[account(constraint = authority.key() == ORACLE_AUTHORITY)]
    pub authority: Signer<'info>,
    
    /// CHECK: User being verified (not signer)
    pub user: AccountInfo<'info>,
}
```

### Anti-Sybil Strategy
- **PDA per user**: `seeds = [b"verification", user_pubkey]`
- **Cross-chain dedup**: Backend DB tracks `unique_id` across all chains
- **Timestamp tracking**: Prevent replay attacks
- **Compute budget**: <200k CU per instruction

---

## 🌉 Multi-Chain Design

**Hybrid Approach:**

```
User → Frontend → Backend (Node.js)
                     ↓
    ┌────────────────┴────────────────┐
    ↓                                 ↓
EVM Contracts (Solidity)      Solana Program (Rust)
- ECDSA signing               - Ed25519 signing
- Storage: mapping            - Storage: PDA accounts
- Gas: ~$0.01                 - Rent: ~0.002 SOL one-time
```

**Why Backend?**
- External APIs (Gitcoin, BrightID) can't call from on-chain
- Cross-chain deduplication needs centralized check
- Simpler + cheaper for MVP

**Future:** Wormhole/LayerZero bridges for fully decentralized option

---

## 📊 Account Model vs EVM

**EVM (mapping storage):**
```solidity
mapping(address => VerificationData) verifications;
// Every read/write = SLOAD/SSTORE (expensive)
```

**Solana (PDA accounts):**
```rust
// Each user has isolated PDA
[verification_pda_user1] // Parallel access
[verification_pda_user2] // No lock contention
[verification_pda_userN]
```

**Benefits:** Cheaper reads, parallel processing, user owns data

---

## 🚀 Deployment Plan

### Phase 1: Hackathon (Now - 48 hours)
- ✅ Architecture designed
- 🚧 Rust program (verify + check instructions)
- 🚧 Anchor tests
- 🚧 Devnet deployment
- 🚧 Frontend Phantom wallet integration

### Phase 2: Testnet (Post-Hackathon)
- Security audit (OtterSec/Neodyme)
- Load testing (10k+ verifications)
- Beta with Solana GameFi projects

### Phase 3: Mainnet (Month 3)
- Production deployment
- Multi-sig authority (3-of-5)
- Monitoring (Datadog)
- Insurance (Nexus Mutual)

---

## 🛡️ Solana-Specific Security

**Compute Budget:** Max 200k CU per tx
- `initialize_verification`: ~5k CU
- `verify_user`: ~15k CU
- `is_verified`: ~400 CU

**Rent Exemption:** 0.002 SOL per PDA (~$0.20)
- Covers ~890 years of rent
- One-time cost, forever stored

**Account Ownership:**
- Program owns all PDAs (via `init`)
- Only program can modify PDA data
- Users can read via RPC (permissionless)

---

## 📝 Integration Example

**dApp checks verification:**

```typescript
// Frontend (TypeScript)
import { Program, AnchorProvider } from '@coral-xyz/anchor';

const program = new Program(IDL, programId, provider);

const [verificationPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from('verification'), userPubkey.toBuffer()],
  programId
);

const verification = await program.account.userVerification.fetch(
  verificationPDA
);

if (verification.isVerified) {
  console.log('✅ User verified, trust score:', verification.trustScore);
  // Allow access
} else {
  console.log('❌ Not verified');
  // Redirect to verification flow
}
```

---

## 🎯 Success Metrics

**Hackathon Goals:**
- ✅ Program deployed on Devnet
- ✅ 1 end-to-end verification demo
- ✅ Tests passing

**3-Month Goals:**
- 10+ Solana dApps integrated
- 10k+ verifications on mainnet
- <$0.001 avg cost per verification

---

**Built by NotABot Team | ETH Bishkek 2024 Winners | Expanding to Solana**

