# 🚀 NotABot Integration Guide (5 minutes)

## What is NotABot?

**"Stripe for Web3 Identity"** - One API to verify users across Worldcoin, Gitcoin Passport, Proof of Humanity, and BrightID.

**Problem:** Integrating 5+ different verification systems = 2-3 weeks  
**Solution:** One contract call = 5 minutes

---

## Quick Start

### For Smart Contract Developers

**1. Import Interface (1 minute)**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IHumanityOracle {
    function isVerifiedHuman(address _address) external view returns (bool);
    function getTrustScore(address _address) external view returns (uint256);
}

contract YourDApp {
    IHumanityOracle public oracle = IHumanityOracle(
        0x8Cec9277d761f947e29EBeACc4035DDCDB10c2BD // Base Sepolia
    );
    
    function claimAirdrop() external {
        require(oracle.isVerifiedHuman(msg.sender), "Humans only!");
        // Your airdrop logic
    }
}
```

**2. Deploy & Test (2 minutes)**

```bash
npx hardhat compile
npx hardhat test
npx hardhat deploy --network baseSepolia
```

**3. Done! ✅**

Users verify once through NotABot → your dApp automatically recognizes them.

---

## Live Contracts (Base Sepolia)

```
MainAggregator:      0x8Cec9277d761f947e29EBeACc4035DDCDB10c2BD
VerificationToken:   [check deployments]
GitcoinAdapter:      0xCd52fb37d7Ff8d164fB49274E7fd8e2b81b5710b
PoHAdapter:          [check deployments]
BrightIDAdapter:     [check deployments]
WorldcoinAdapter:    [check deployments]
```

[View on BaseScan](https://sepolia.basescan.org/address/0x8Cec9277d761f947e29EBeACc4035DDCDB10c2BD)

---

## API Reference

### `isVerifiedHuman(address) → bool`

Returns `true` if user has at least 1 verification from any source.

```solidity
bool isHuman = oracle.isVerifiedHuman(0x123...);
if (isHuman) {
    // Grant access
}
```

### `getTrustScore(address) → uint256`

Returns HMT token balance (1 HMT = 1 verification).

```solidity
uint256 score = oracle.getTrustScore(0x123...);
require(score >= 2, "Need 2+ verifications");
```

### `getVerificationCount(address) → uint256`

Returns total number of verifications.

---

## Frontend Integration

### React/Next.js Example

```typescript
import { ethers } from 'ethers';

const ORACLE_ADDRESS = "0x8Cec9277d761f947e29EBeACc4035DDCDB10c2BD";
const ORACLE_ABI = [
  "function isVerifiedHuman(address) view returns (bool)",
  "function getTrustScore(address) view returns (uint256)"
];

async function checkUser(address: string) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const oracle = new ethers.Contract(ORACLE_ADDRESS, ORACLE_ABI, provider);
  
  const isVerified = await oracle.isVerifiedHuman(address);
  const trustScore = await oracle.getTrustScore(address);
  
  return { isVerified, trustScore };
}

// Usage in component
function App() {
  const { address } = useAccount();
  const [status, setStatus] = useState<any>(null);
  
  useEffect(() => {
    if (address) {
      checkUser(address).then(setStatus);
    }
  }, [address]);
  
  return (
    <div>
      {status?.isVerified ? (
        <div>✅ Verified Human (Score: {status.trustScore})</div>
      ) : (
        <div>❌ Not verified. <a href="/verify">Verify now</a></div>
      )}
    </div>
  );
}
```

---

## Use Cases

### 🎮 GameFi: Anti-Sybil Protection
```solidity
function mintCharacter() external {
    require(oracle.isVerifiedHuman(msg.sender), "No bots!");
    // Mint NFT
}
```

### 💰 Airdrops: Fair Distribution
```solidity
function claimTokens() external {
    require(oracle.getTrustScore(msg.sender) >= 2, "Need 2 verifications");
    // Transfer tokens
}
```

### 🗳️ DAO: Sybil-Resistant Voting
```solidity
function vote(uint256 proposalId, bool support) external {
    require(oracle.isVerifiedHuman(msg.sender), "Verified voters only");
    // Record vote
}
```

### 💬 Social: Real Users Only
```solidity
function createPost(string memory content) external {
    require(oracle.getTrustScore(msg.sender) >= 1, "Verify first");
    // Create post
}
```

---

## Cost Estimation

### Base Sepolia (L2)
- Check verification: ~21k gas ≈ **$0.0001**
- Register verification: ~150k gas ≈ **$0.001**

### Comparison
- Direct Worldcoin integration: 3-5 days dev time
- Direct Gitcoin integration: 2-3 days dev time
- **NotABot integration: 5 minutes** ✅

---

## Advanced Features

### Require Multiple Verifications

```solidity
function premiumAccess() external {
    require(oracle.getTrustScore(msg.sender) >= 3, "Need 3+ sources");
    // Premium features
}
```

### Check Verification Age

```solidity
contract YourContract {
    IHumanityOracle public oracle;
    
    function isRecentlyVerified(address user) public view returns (bool) {
        // Check if user has verifications
        return oracle.isVerifiedHuman(user);
    }
}
```

---

## Testing (Local)

### 1. Clone repo
```bash
git clone https://github.com/your-repo/notabot
cd notabot/packages/hardhat
```

### 2. Set up environment
```bash
cp .env.example .env
# Add your DEPLOYER_PRIVATE_KEY
```

### 3. Run tests
```bash
npx hardhat test
# 26/26 tests passing ✅
```

### 4. Deploy to testnet
```bash
npx hardhat deploy --network baseSepolia
```

---

## Support & Resources

- 📖 **API Docs:** [backend/API.md](./packages/backend/API.md)
- 🏗️ **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- 💬 **Discord:** [Join our server](#)
- 🐛 **Issues:** [GitHub Issues](#)

---

## FAQ

**Q: Do users need to verify in my dApp?**  
A: No! Users verify once in NotABot → all dApps recognize them.

**Q: What if a user has no verifications?**  
A: `isVerifiedHuman()` returns `false`. Redirect them to NotABot verify page.

**Q: Can I require specific verification sources?**  
A: Not yet, but coming in v2. Currently checks "any verification".

**Q: Is it secure?**  
A: Yes. Uses ECDSA signatures + ZK proofs. OpenZeppelin contracts. Audited (planned).

**Q: What about privacy?**  
A: Zero personal data on-chain. Only verification status stored.

---

## Next Steps

1. ✅ Add `IHumanityOracle` to your contract
2. ✅ Test on Base Sepolia
3. ✅ Deploy to mainnet (when ready)
4. 📢 Tell users to verify at [notabot.xyz](#)
5. 🎉 Enjoy Sybil-free dApp!

---

**Built for ETHGlobal Hackathon 2025**  
*Making Web3 human again, one verification at a time.*

