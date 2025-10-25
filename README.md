<div align="center">

# 🤖 NotABot

### "Stripe for Web3 Identity" - Universal Proof-of-Humanity Aggregator

**Verify once with Worldcoin/Gitcoin/CEX KYC → Get Soulbound NFT → Access any dApp**

[![Built with Scaffold-ETH 2](https://img.shields.io/badge/Built%20with-Scaffold--ETH%202-blue)](https://scaffoldeth.io)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?logo=solidity)](https://soliditylang.org)
[![Base L2](https://img.shields.io/badge/Network-Base%20L2-0052FF)](https://base.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

[Demo](http://localhost:3000) • [Architecture](./contracts/ARCHITECTURE.MD) • [Security](./SAFE.MD)

</div>

---

## 🎯 The Problem

**Web3 identity is fragmented:**
- Users verify separately for EVERY dApp (Worldcoin here, Gitcoin there...)
- Developers integrate 5+ different verification APIs with different formats
- **60-90% of airdrops stolen by Sybil bots** = $1B+/year losses in GameFi
- 500M+ CEX users already KYC'd but can't leverage it on-chain

## ✅ Our Solution

**One integration, multiple verification sources:**

```solidity
// dApp code (ONE LINE):
require(oracle.isVerifiedHuman(msg.sender), "Humans only");
```

**Behind the scenes:**
- ✅ Worldcoin (biometric ZK proof)
- ✅ Gitcoin Passport (reputation score)
- 🔜 Binance/Coinbase KYC (roadmap)

**Users get:**
- 1 HMT Token (ERC-20 reward)
- 1 Soulbound NFT (permanent proof)
- Universal identity across ALL dApps

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.18.3
- Yarn
- Metamask

### Installation

```bash
git clone https://github.com/your-org/notabot.git
cd notabot
yarn install
```

### Local Development

```bash
# Terminal 1: Start local blockchain
yarn chain

# Terminal 2: Deploy contracts
yarn deploy

# Terminal 3: Start frontend
yarn start
```

Visit `http://localhost:3000`

**Debug UI:** `http://localhost:3000/debug` (interact with contracts)

---

## 🏗️ Architecture

### Core Contracts (Base L2)

| Contract | Description | Address |
|----------|-------------|---------|
| `MainAggregator.sol` | Core orchestrator, mints tokens/SBTs | [View](./packages/hardhat/contracts/core/MainAggregator.sol) |
| `VerificationToken.sol` | HMT ERC-20 token (1 per verification) | [View](./packages/hardhat/contracts/core/VerificationToken.sol) |
| `VerificationSBT.sol` | Soulbound NFT (non-transferable proof) | [View](./packages/hardhat/contracts/core/VerificationSBT.sol) |

### Adapters (Modular & Pluggable)

| Adapter | Status | Type | Integration |
|---------|--------|------|-------------|
| **WorldcoinAdapter** | ✅ Live | ZK proof via World ID Router | 3h |
| **GitcoinAdapter** | ✅ Live | Passport API + ECDSA signature | 3h |
| BinanceAdapter | 🔜 Roadmap | OAuth + KYC API | TBD |

**Design Pattern:**
```
User → Adapter (verify proof) → MainAggregator (register) → Mint HMT + SBT
```

---

## 📋 Usage Examples

### For dApp Developers

**1. Check if user is verified:**
```solidity
import "@notabot/contracts/IHumanityOracle.sol";

contract MyGameFi {
    IHumanityOracle oracle = IHumanityOracle(0x...);
    
    function claimAirdrop() external {
        require(oracle.isVerifiedHuman(msg.sender), "Humans only");
        // Your logic here
    }
}
```

**2. Get user's trust score:**
```solidity
uint256 score = oracle.getTrustScore(msg.sender);
require(score >= 10, "Insufficient trust score");
```

### For Frontend Developers

```typescript
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

// Check verification status
const { data: isVerified } = useScaffoldReadContract({
  contractName: "MainAggregator",
  functionName: "isVerifiedHuman",
  args: [address]
});

// Verify with Worldcoin
const { writeAsync: verifyWorldcoin } = useScaffoldWriteContract({
  contractName: "WorldcoinAdapter",
  functionName: "verifyAndRegister"
});
```

---

## 🎪 Demo Flow

**Scenario: Alice joins a Sybil-resistant GameFi**

1. Alice clicks "Verify with NotABot"
2. Chooses Worldcoin → World ID app opens
3. Submits ZK proof → Contract verifies
4. Receives: 1 HMT Token + 1 Soulbound NFT
5. GameFi checks `isVerifiedHuman(alice)` → ✅ Access granted
6. Alice visits ANOTHER dApp → Instant access (no re-verification!)

---

## 🛡️ Security Features

- **Anti-Sybil:** Cross-source uniqueId prevents duplicate verifications
- **Replay Protection:** Timestamp window (1 hour max)
- **Privacy-Preserving:** ZK proofs + no raw data on-chain
- **Battle-Tested:** OpenZeppelin v5.x (AccessControl, ReentrancyGuard, Pausable)
- **CEI Pattern:** Checks-Effects-Interactions throughout

[Full Security Audit](./SAFE.MD)

---

## 🎯 Roadmap

### ✅ Phase 1 (Current)
- Core contracts deployed (localhost + Base Sepolia)
- Worldcoin + Gitcoin adapters working
- Scaffold-ETH 2 frontend

### 🔜 Phase 2 (Q1 2025)
- Binance/Coinbase partnership applications
- 5+ more adapters (PoH, BrightID, ENS)
- Mainnet launch (Base L2)

### 🚀 Phase 3 (Q2 2025)
- Cross-chain SBT (Hyperlane/LayerZero)
- First 10 dApp integrations
- SaaS for dApps ($X/month API access)

---

## 🛠️ Tech Stack

**Smart Contracts:**
- Solidity ^0.8.20
- Hardhat (testing + deployment)
- OpenZeppelin Contracts v5.x
- Base L2 (target: <$0.01/tx)

**Frontend:**
- Next.js 15 + TypeScript
- Scaffold-ETH 2 (wagmi + viem + RainbowKit)
- TailwindCSS + DaisyUI

**Backend (Gitcoin):**
- Node.js + Express
- Gitcoin Passport API
- ECDSA signing (ethers.js)

---

## 📚 Documentation

- [Architecture Overview](./contracts/ARCHITECTURE.MD)
- [Security Design](./SAFE.MD)
- [Development Guide](./contracts/4STEPSPROD.MD)
- [Main Idea](./MAIN_IDEA.MD)

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md)

**Key Areas:**
- New verification adapters
- Frontend UI improvements
- Security audits
- Documentation

---

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

## 🏆 Built with Scaffold-ETH 2

This project was bootstrapped with [Scaffold-ETH 2](https://scaffoldeth.io).

**Sponsors:** BuidlGuidl

---

<div align="center">

**TL;DR:** Verify once → Get SBT → Access everywhere. One line of code for dApps.

Made with ❤️ for Web3

</div>
