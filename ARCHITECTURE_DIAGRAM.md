# NotABot Architecture

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

