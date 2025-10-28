# NotABot Architecture
**Universal Multi-Chain Proof-of-Humanity Protocol**

---

## 🌐 Multi-Chain Vision

NotABot is the **first chain-agnostic identity verification protocol**.  
Verify once → Use everywhere (EVM chains + Solana + future: Aptos, Sui, etc.)

### Supported Networks

| Blockchain | Status | Network | Details |
|------------|--------|---------|---------|
| **Base L2** | ✅ Deployed | Sepolia Testnet | Primary EVM deployment |
| **Status Network** | ✅ Deployed | Testnet | Alternative EVM chain |
| **Solana** | 🆕 NEW | Devnet (deploying) | Non-EVM expansion |
| Ethereum | 🔜 Roadmap | Mainnet | Post-audit |
| Optimism | 🔜 Roadmap | Mainnet | Q2 2025 |
| Arbitrum | 🔜 Roadmap | Mainnet | Q2 2025 |

**Why Multi-Chain?**
- Different ecosystems, different users
- Solana = best for gaming (speed + cost)
- EVM = best for DeFi (liquidity + maturity)
- Users choose, we support all

---

## System Overview

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        UI[User Interface]
        WC[Worldcoin Widget]
    end
    
    subgraph "Backend (Node.js)"
        API[Express API]
        SIGNER[ECDSA Signer]
    end
    
    subgraph "External APIs"
        GITCOIN[Gitcoin Passport API]
        POH_API[Proof of Humanity API]
        BRIGHTID_API[BrightID API]
    end
    
    subgraph "Smart Contracts (Base L2)"
        direction TB
        WCA[WorldcoinAdapter]
        GCA[GitcoinAdapter]
        POHA[PoHAdapter]
        BIA[BrightIDAdapter]
        
        MAIN[MainAggregator]
        TOKEN[VerificationToken ERC-20]
        
        WCA --> MAIN
        GCA --> MAIN
        POHA --> MAIN
        BIA --> MAIN
        MAIN --> TOKEN
    end
    
    UI --> WC
    WC --> WCA
    
    UI --> API
    API --> GITCOIN
    API --> POH_API
    API --> BRIGHTID_API
    
    API --> SIGNER
    SIGNER --> |Signed Proof| UI
    
    UI --> GCA
    UI --> POHA
    UI --> BIA
    
    MAIN --> |Mint HMT| TOKEN
    TOKEN --> |Balance| UI
    
    style MAIN fill:#7b61ff,stroke:#5f47f6,color:#fff
    style TOKEN fill:#22d3ee,stroke:#06b6d4,color:#000
    style WCA fill:#000,stroke:#fff,color:#fff
    style GCA fill:#00E6A0,stroke:#00D494,color:#000
    style POHA fill:#FF6B9D,stroke:#FF4A7D,color:#fff
    style BIA fill:#FDB32A,stroke:#FFA500,color:#fff
```

---

## Multi-Chain Architecture (NEW!)

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[Next.js Frontend]
        CS[Chain Selector]
        EVM_WALLET[EVM Wallets<br/>MetaMask, Rainbow]
        SOL_WALLET[Solana Wallets<br/>Phantom, Solflare]
        
        UI --> CS
        CS --> EVM_WALLET
        CS --> SOL_WALLET
    end
    
    subgraph "Backend Layer - Chain Agnostic"
        API[Express API Server]
        GITCOIN_SVC[Gitcoin Service]
        BRIGHTID_SVC[BrightID Service]
        POH_SVC[PoH Service]
        
        EVM_SIGNER[EVM Signer<br/>ECDSA]
        SOL_SIGNER[Solana Signer<br/>Ed25519]
        
        API --> GITCOIN_SVC
        API --> BRIGHTID_SVC
        API --> POH_SVC
        API --> EVM_SIGNER
        API --> SOL_SIGNER
    end
    
    subgraph "Blockchain Layer - EVM Chains"
        BASE[Base L2 Contracts]
        STATUS[Status Network Contracts]
        ETH[Ethereum Mainnet<br/>Coming Soon]
        
        MAIN_EVM[MainAggregator.sol]
        ADAPTERS_EVM[4x Adapters]
        TOKEN_EVM[VerificationToken]
        
        BASE --> MAIN_EVM
        STATUS --> MAIN_EVM
        MAIN_EVM --> ADAPTERS_EVM
        MAIN_EVM --> TOKEN_EVM
    end
    
    subgraph "Blockchain Layer - Solana"
        SOL_DEV[Solana Devnet]
        SOL_MAIN[Solana Mainnet<br/>Coming Soon]
        
        PROGRAM[notabot Program]
        PDA[User Verification PDAs]
        
        SOL_DEV --> PROGRAM
        PROGRAM --> PDA
    end
    
    EVM_WALLET --> BASE
    EVM_WALLET --> STATUS
    SOL_WALLET --> SOL_DEV
    
    EVM_SIGNER --> MAIN_EVM
    SOL_SIGNER --> PROGRAM
    
    style UI fill:#60a5fa,stroke:#3b82f6,color:#fff
    style API fill:#34d399,stroke:#10b981,color:#000
    style MAIN_EVM fill:#7b61ff,stroke:#5f47f6,color:#fff
    style PROGRAM fill:#9945FF,stroke:#14F195,color:#fff
    style SOL_DEV fill:#14F195,stroke:#9945FF,color:#000
```

**Key Design Principles:**
- ✅ **Backend is Chain-Agnostic**: Same verification logic for all chains
- ✅ **Frontend Supports All Wallets**: Users choose their preferred chain
- ✅ **Smart Contracts Are Chain-Specific**: Optimized for each platform
- ✅ **Cross-Chain Deduplication**: Backend prevents same identity across chains

---

## Verification Flow

### Option 1: Worldcoin (Pure On-Chain)

```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant WC as Worldcoin Widget
    participant WCA as WorldcoinAdapter
    participant MAIN as MainAggregator
    participant TOKEN as HMT Token
    
    User->>UI: Click "Verify with Worldcoin"
    UI->>WC: Open Widget
    WC->>WC: ZK Proof Generation
    WC->>UI: Return proof
    UI->>WCA: verifyAndRegister(user, proof)
    WCA->>WCA: Verify ZK Proof (on-chain)
    WCA->>MAIN: registerVerification(user, 0, nullifier, proof)
    MAIN->>MAIN: Check duplicate (usedUniqueIds)
    MAIN->>TOKEN: transfer(user, 1 HMT)
    TOKEN->>User: +1 HMT
    MAIN->>UI: ✅ Verified
```

### Option 2: Gitcoin/PoH/BrightID (Hybrid)

```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant API as Backend API
    participant EXT as External API
    participant SIGNER as ECDSA Signer
    participant GCA as GitcoinAdapter
    participant MAIN as MainAggregator
    participant TOKEN as HMT Token
    
    User->>UI: Click "Verify with Gitcoin"
    UI->>API: POST /api/demo/verify
    API->>EXT: Get Passport Score
    EXT->>API: score = 99
    API->>SIGNER: Sign(userAddress, userId, score, timestamp)
    SIGNER->>API: ECDSA Signature
    API->>UI: { userId, score, signature }
    UI->>UI: Encode proof
    UI->>GCA: verifyAndRegister(user, proof)
    GCA->>GCA: Recover signer from signature
    GCA->>GCA: Verify backendOracle address
    GCA->>MAIN: registerVerification(user, 1, userId, proof)
    MAIN->>MAIN: Check duplicate (usedUniqueIds)
    MAIN->>TOKEN: transfer(user, 1 HMT)
    TOKEN->>User: +1 HMT
    MAIN->>UI: ✅ Verified
```

## Contract Architecture

```mermaid
classDiagram
    class IHumanityOracle {
        <<interface>>
        +isVerifiedHuman(address) bool
        +getTrustScore(address) uint256
    }
    
    class MainAggregator {
        +IERC20 verificationToken
        +mapping userVerifications
        +mapping usedUniqueIds
        +registerVerification(user, source, uniqueId, proof)
        +isVerifiedHuman(address) bool
        +getTrustScore(address) uint256
    }
    
    class IVerificationAdapter {
        <<interface>>
        +verifyAndRegister(user, proof)
        +getSourceId() uint8
    }
    
    class WorldcoinAdapter {
        +IWorldID worldId
        +verifyAndRegister(user, root, nullifier, proof)
    }
    
    class GitcoinAdapter {
        +address backendOracle
        +mapping usedProofs
        +verifyAndRegister(user, proof)
    }
    
    class PoHAdapter {
        +address backendOracle
        +mapping usedProofs
        +verifyAndRegister(user, proof)
    }
    
    class BrightIDAdapter {
        +address backendOracle
        +mapping usedProofs
        +verifyAndRegister(user, proof)
    }
    
    IHumanityOracle <|.. MainAggregator
    IVerificationAdapter <|.. WorldcoinAdapter
    IVerificationAdapter <|.. GitcoinAdapter
    IVerificationAdapter <|.. PoHAdapter
    IVerificationAdapter <|.. BrightIDAdapter
    
    WorldcoinAdapter --> MainAggregator
    GitcoinAdapter --> MainAggregator
    PoHAdapter --> MainAggregator
    BrightIDAdapter --> MainAggregator
```

## Tech Stack

```mermaid
graph LR
    subgraph "Smart Contracts"
        SOL[Solidity ^0.8.20]
        OZ[OpenZeppelin v5.x]
        HH[Hardhat]
    end
    
    subgraph "Frontend"
        NEXT[Next.js]
        RK[RainbowKit]
        WAGMI[Wagmi]
    end
    
    subgraph "Backend"
        NODE[Node.js + Express]
        ETHERS[ethers.js]
    end
    
    subgraph "Deployment"
        BASE[Base Sepolia L2]
        STATUS[Status Network]
    end
    
    SOL --> OZ
    SOL --> HH
    NEXT --> RK
    NEXT --> WAGMI
    NODE --> ETHERS
    
    HH --> BASE
    HH --> STATUS
```

## Security Features

```mermaid
mindmap
  root((Security))
    On-Chain
      ReentrancyGuard
      Pausable
      Access Control
    Signature Verification
      ECDSA Recovery
      Timestamp Check
      Proof Expiry
    Duplicate Prevention
      usedUniqueIds mapping
      usedProofs mapping
      Nullifier checks
    CEI Pattern
      Checks first
      Effects second
      Interactions last
```

## Deployment Addresses

**Base Sepolia Testnet (Chain ID: 84532)**

| Contract | Address |
|----------|---------|
| VerificationToken (HMT) | `0x9f12107874B1ED8B10AED87e19E4BDf5ea17a45B` |
| MainAggregator | `0xFcB998E4c6A0157dEF6AC724Da1279aA6Ac2743D` |
| WorldcoinAdapter | `0x...` (TBD) |
| GitcoinAdapter | `0xCd52fb37d7Ff8d164fB49274E7fd8e2b81b5710b` |
| PoHAdapter | `0xc2fF5af5C12B7085dC49415Cb81e29B8524E06C0` |
| BrightIDAdapter | `0xAeCEbf9B937D1B36C2ed5D2C2190673eA3CC82de` |

---

**Gas Costs (Base L2)**

- Worldcoin verification: ~$0.02
- Gitcoin/PoH/BrightID verification: ~$0.01
- Query `isVerifiedHuman()`: < $0.001

**Why Base L2?**
- 10x cheaper than Ethereum mainnet
- Same security (rollup to Ethereum)
- Built-in bridging with Superchain
- Native support for OP Stack

---

## 🌟 Solana Integration (NEW!)

**Solana Devnet Deployment (In Progress)**

### Why Solana?

**The Sybil Problem Paradox:**
- Solana transactions cost ~$0.00025 (400x cheaper than Base L2)
- Creating 10,000 fake wallets costs ~$2.50 vs $20,000 on Ethereum
- **Result:** Best UX + Worst Sybil problem = WE'RE NEEDED MOST HERE


### Solana Program Architecture

```
Program: notabot.so
├── Instructions:
│   ├── initialize_verification(user: Pubkey)
│   ├── verify_user(source: String, unique_id: String)
│   ├── is_verified(user: Pubkey) -> bool
│   └── get_trust_score(user: Pubkey) -> u64
│
├── Accounts:
│   ├── UserVerification PDA (per user)
│   │   ├── user: Pubkey
│   │   ├── is_verified: bool
│   │   ├── source: String
│   │   ├── trust_score: u64
│   │   └── timestamp: i64
│   │
│   └── OracleAuthority (global)
│       └── authorized_signers: Vec<Pubkey>
│
└── Security:
    ├── PDA-based authority (not msg.sender)
    ├── Backend Ed25519 signatures
    └── Cross-chain deduplication (via backend DB)
```

### Deployment Plan

**Phase 1: Hackathon (Now)**
- ✅ Architecture designed
- 🚧 Rust program implementation
- 🚧 Anchor tests
- ⏳ Devnet deployment
- ⏳ Frontend integration

**Phase 2: Testnet (Post-Hackathon)**
- Security audit (OtterSec or Neodyme)
- Load testing (10k+ verifications)
- Beta program (invite Solana GameFi projects)

**Phase 3: Mainnet (Month 3)**
- Production deployment
- Multi-sig authority (3-of-5)
- Insurance coverage (Nexus Mutual)
- Monitoring & alerting

### Documentation

For detailed Solana architecture:
📖 **[packages/solana/ARCHITECTURE.md](./packages/solana/ARCHITECTURE.md)**
---
### Technical Excellence

**What Makes Us Different:**
1. ✅ **First Multi-Chain PoH Aggregator** (pioneer advantage)
2. ✅ **Chain-Agnostic Backend** (easy to add new chains)
3. ✅ **Universal Interface** (same API for all chains)
4. ✅ **Already Proven** (ETH Bishkek 2025 winners 🏆)

---


