<div align="center">

# 🤖 NotABot

### "Stripe for Web3 Identity"
https://mainhntrepo-nextjs-uurk.vercel.app/

**Universal Multi-Chain Proof-of-Humanity Protocol**  
Verify once on ANY chain → Access everywhere

[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?logo=solidity)](https://soliditylang.org)
[![Rust](https://img.shields.io/badge/Rust-Anchor-orange?logo=rust)](https://www.rust-lang.org)
[![Base L2](https://img.shields.io/badge/Network-Base%20Sepolia-0052FF)](https://base.org)
[![Solana](https://img.shields.io/badge/Network-Solana%20Devnet-9945FF)](https://solana.com)
[![Status Network](https://img.shields.io/badge/Network-Status%20Testnet-5B6CD9)](https://status.network)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**🏆 ETH Bishkek 2024 Winners** | Now Expanding to Solana

[🏗️ Architecture](./ARCHITECTURE_DIAGRAM.md) • [📡 API Docs](./packages/backend/API.md) • [⚡ Solana Docs](./packages/solana/ARCHITECTURE.md)

</div>

---

## 🌐 Multi-Chain Expansion

**We won ETH Bishkek with Base L2 deployment. Now we're going everywhere.**

| Blockchain | Status | Why It Matters |
|------------|--------|----------------|
| **Base L2** | ✅ Deployed | EVM DeFi ecosystem |
| **Status Network** | ✅ Deployed | Privacy-focused L2 |
| **Solana** | 🚧 Deploying | GameFi + 65k TPS |
| Ethereum | 🔜 Q2 2025 | Maximum security |
| Optimism | 🔜 Q2 2025 | Superchain bridge |
| Arbitrum | 🔜 Q2 2025 | Largest L2 |

**Vision:** Become THE identity layer for ALL of Web3, not just one chain.

---

## The Problem

Airdrops are getting destroyed by bots. 60-90% of participants aren't real humans. Arbitrum lost $50M+ in 2023 alone.

**Solana's Problem is WORSE:**
- Transactions cost $0.00025 (vs $2+ on Ethereum)
- Creating 10,000 fake wallets = $2.50 total
- Every Solana airdrop gets farmed to death
- GameFi projects can't prevent multi-accounting

Existing solutions are fragmented:
- Worldcoin requires physical orb access
- Gitcoin Passport needs manual stamp collection  
- Proof of Humanity has high friction
- Every project integrates these separately (2-4 weeks each)
- **NONE work across multiple chains**

## Our Solution

One contract. Multiple verification sources. Zero complexity.

```solidity
// Your dApp code:
bool isHuman = IHumanityOracle(AGGREGATOR).isVerifiedHuman(user);
```

Supports:
- Worldcoin (ZK biometric proof)
- Gitcoin Passport (reputation score)
- Proof of Humanity (video verification)
- BrightID (social graph)
- Binance KYC (coming soon)

Each verification gives users 1 HMT token. More verifications = higher trust score.

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

## Architecture

**Core Contracts (Base Sepolia + Status Network)**

| Contract | Address |
|----------|---------|
| MainAggregator | `0xFcB998E4c6A0157dEF6AC724Da1279aA6Ac2743D` |
| VerificationToken (HMT) | `0x9f12107874B1ED8B10AED87e19E4BDf5ea17a45B` |
| GitcoinAdapter | `0xCd52fb37d7Ff8d164fB49274E7fd8e2b81b5710b` |
| PoHAdapter | `0xc2fF5af5C12B7085dC49415Cb81e29B8524E06C0` |
| BrightIDAdapter | `0xAeCEbf9B937D1B36C2ed5D2C2190673eA3CC82de` |

**How it works:**
```
User → Adapter verifies proof → MainAggregator registers → Mints 1 HMT token
```

See detailed diagrams: [ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)

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

## Live Demo

**Backend API:** https://mainhntrepo-production.up.railway.app

**Test it:**
```bash
curl -X POST https://mainhntrepo-production.up.railway.app/api/demo/verify \
  -H "Content-Type: application/json" \
  -d '{"userAddress": "0xYOUR_ADDRESS", "source": "gitcoin"}'
```

**How it works:**
1. Connect wallet, pick verification source
2. Backend signs your proof
3. Submit to contract → get 1 HMT token
4. Now you're verified on-chain

---

## Security

- Duplicate prevention via `usedUniqueIds` mapping
- Timestamp expiry (1 hour max)
- ECDSA signature verification
- OpenZeppelin contracts (ReentrancyGuard, Pausable)
- CEI pattern everywhere

See [SAFE.MD](./SAFE.MD) for details.

---

## 🎯 Roadmap

### ✅ Hackathon MVP (Done!)
- ✅ Core contracts deployed on Base Sepolia
- ✅ 4 adapters: Worldcoin, Gitcoin, PoH, BrightID
- ✅ Backend API with demo mode
- ✅ Integration guide (5 minutes)
- ✅ 26/26 tests passing

### 🔜 Post-Hackathon (1 month)
- Mainnet launch (Base L2)
- Real Worldcoin/PoH/BrightID integrations (remove demo mode)
- First 5 dApp partnerships
- Security audit

### 🚀 Long-term Vision
- Binance/Coinbase KYC adapters
- Cross-chain SBT (Hyperlane/LayerZero)
- SaaS model ($99/month for dApps)
- Become standard for Web3 identity

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
- TailwindCSS + DaisyUI + Antd design

**Backend (Gitcoin):**
- Node.js + Express
- Gitcoin Passport API
- ECDSA signing (ethers.js)

---

## 📚 Documentation

- **[5-Minute Integration Guide](./INTEGRATION.md)** ← Start here!
- [Architecture Overview](./contracts/ARCHITECTURE.MD)
- [Backend API Reference](./packages/backend/API.md)
- [Demo Script](./DEMO_SCRIPT.md)
- [Security Design](./SAFE.MD)
- [Main Idea & Pitch](./MAIN_IDEA.MD)

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

**TL;DR:** Verify once → Access everywhere. 5-minute integration for dApps.

### 🏆 Built for ETHGlobal Hackathon 2025

**Live on Base Sepolia** • **4 Verification Sources** • **26/26 Tests Passing**

[Try Demo](#) • [Integration Guide](./INTEGRATION.md) • [Watch Video](#)

Made with ❤️ for Web3

</div>
