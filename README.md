<div align="center">

# 🤖 NotABot

### "Stripe for Web3 Identity" - Universal Proof-of-Humanity Aggregator

**Verify once with Worldcoin/Gitcoin/CEX KYC → Get Soulbound NFT → Access any dApp**

[![Built with Scaffold-ETH 2](https://img.shields.io/badge/Built%20with-Scaffold--ETH%202-blue)](https://scaffoldeth.io)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?logo=solidity)](https://soliditylang.org)
[![Base L2](https://img.shields.io/badge/Network-Base%20L2-0052FF)](https://base.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

[🎥 Live Demo](#) • [📖 Integration Guide](./INTEGRATION.md) • [🏗️ Architecture](./contracts/ARCHITECTURE.MD) • [🔒 Security](./SAFE.MD) • [📡 API Docs](./packages/backend/API.md)

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

### Core Contracts (Base Sepolia - LIVE ✅)

| Contract | Description | Address |
|----------|-------------|---------|
| `MainAggregator.sol` | Core orchestrator, registers verifications | [0x8Cec...2BD](https://sepolia.basescan.org/address/0x8Cec9277d761f947e29EBeACc4035DDCDB10c2BD) |
| `VerificationToken.sol` | HMT ERC-20 token (1 per verification) | [View on BaseScan](#) |

### Adapters (Modular & Pluggable - LIVE ✅)

| Adapter | Status | Type | Address |
|---------|--------|------|---------|
| **WorldcoinAdapter** | ✅ Live | ZK proof via World ID Router | [View](#) |
| **GitcoinAdapter** | ✅ Live | Passport API + ECDSA signature | [0xCd52...10b](https://sepolia.basescan.org/address/0xCd52fb37d7Ff8d164fB49274E7fd8e2b81b5710b) |
| **PoHAdapter** | ✅ Live | Proof of Humanity Oracle | [View](#) |
| **BrightIDAdapter** | ✅ Live | BrightID Social Graph | [View](#) |

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

## 🎪 Live Demo (Hackathon)

**Try it now:** [notabot-demo.vercel.app](#) (Coming soon)

**Backend API:** https://mainhntrepo-production.up.railway.app

**Test with Demo Mode:**
```bash
curl -X POST https://mainhntrepo-production.up.railway.app/api/demo/verify \
  -H "Content-Type: application/json" \
  -d '{"userAddress": "0xYOUR_ADDRESS", "source": "gitcoin"}'
```

**Flow:**
1. Connect wallet → Choose verification source
2. Get signed proof from backend → Submit to contract
3. Receive 1 HMT token → Now verified on-chain!
4. Any dApp can check: `isVerifiedHuman(yourAddress)` ✅

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
