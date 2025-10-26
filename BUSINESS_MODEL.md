# NotABot - Business Model
**"Stripe for Web3 Identity" - Universal KYC Aggregator**

---

## 🎯 One-Liner

**Developers integrate once → Users verify anywhere → Access everything**

We aggregate all proof-of-humanity sources (Worldcoin, Gitcoin, CEX KYC) into ONE smart contract interface. Projects save 15+ days of integration work. Users verify once, use everywhere.

---

## 💰 PRIMARY BUSINESS MODEL: Developer Services

### Target Customer: **Web3 Projects**

#### **Primary Segments:**
1. **GameFi Projects** (Highest Priority)
   - Problem: 60-90% of airdrops stolen by Sybil bots
   - Loss: $1B+/year in GameFi alone
   - Pain: Multi-accounting ruins game economy
   - Solution: `require(oracle.isVerifiedHuman(player))` - one line = no bots

2. **DeFi Protocols**
   - Problem: Governance attacks via Sybil wallets
   - Pain: Airdrop farming, vote manipulation
   - Solution: Weighted voting by trust score

3. **NFT Projects**
   - Problem: Bots mint entire collections in seconds
   - Pain: Real users can't participate, community angry
   - Solution: Whitelist = verified humans only

4. **DAOs & Social Apps**
   - Problem: Need 1 vote = 1 human
   - Pain: Quadratic funding broken by Sybils
   - Solution: On-chain humanity proof

---

### 📊 Value Proposition (For Developers)

#### **Without NotABot:**
```
1. Integrate Worldcoin SDK (5 days)
2. Integrate Gitcoin API (3 days)
3. Integrate Proof of Humanity (3 days)
4. Build custom anti-Sybil logic (7 days)
5. Maintain all integrations (ongoing)
= 18+ days + ongoing costs
```

#### **With NotABot:**
```solidity
import "@notabot/contracts/HumanityProtected.sol";

contract MyGame is HumanityProtected {
    constructor() HumanityProtected(ORACLE_ADDRESS) {}
    
    function claimAirdrop() external onlyHuman {
        // Only verified humans - ONE line!
    }
}
```
= **1 line of code, 10 minutes to integrate**

---

### 💵 Pricing Model (SaaS)

| Tier | Price | Verifications/mo | Target |
|------|-------|------------------|--------|
| **Starter** | $99/mo | Up to 1,000 | Indie games, small DAOs |
| **Growth** | $299/mo | Up to 10,000 | Mid-size GameFi, NFT projects |
| **Enterprise** | Custom | Unlimited | AAA games, major DeFi |
| **Free Tier** | $0 | Up to 100 | Open source, testing |

**Key Metrics:**
- Cost per verification: $0.011 (gas + API)
- Revenue per verification: $0.30 (Growth tier)
- **Gross Margin: ~95%**

---

## 🏆 Competitive Landscape

### Current "Solutions" (Why They Fail)

#### **1. Gitcoin Passport**
- ❌ Off-chain only (scores in API, not on-chain)
- ❌ Requires backend integration (API keys, servers)
- ❌ Not composable with smart contracts
- ❌ Single source (Gitcoin stamps only)
- ✅ **We Win:** On-chain, multi-source, smart contract native

#### **2. Proof of Humanity**
- ❌ Slow verification (manual video review)
- ❌ Single source (only PoH registry)
- ❌ Poor UX (deposit required, can be challenged)
- ❌ Limited chain support (Ethereum mainnet only)
- ✅ **We Win:** Instant verification, multi-source, L2 native

#### **3. Worldcoin**
- ❌ Single source (only Worldcoin Orb)
- ❌ Not everyone has access to Orb
- ❌ Privacy concerns (biometric data)
- ❌ Closed ecosystem
- ✅ **We Win:** We INCLUDE Worldcoin + 5 other sources

#### **4. DIY Solutions**
- ❌ Reinvent the wheel every time
- ❌ 15+ days of integration work
- ❌ Maintenance burden
- ❌ Security risks (custom implementations)
- ✅ **We Win:** Battle-tested, maintained, secure

---

### 🎯 Our Competitive Advantage

**"Stripe Moment" = We're the aggregator, not the source**

| Stripe | NotABot |
|--------|---------|
| Aggregates payment providers | Aggregates identity providers |
| Developers integrate once | Developers integrate once |
| Users choose payment method | Users choose verification method |
| 1 API = Visa, MC, PayPal, etc | 1 contract = Worldcoin, Gitcoin, CEX KYC |

**We don't compete with Gitcoin/Worldcoin - we make them MORE valuable by giving them distribution.**

---

## 🪙 Tokenomics: HMT (Humanity Token)

### Token Utility

#### **1. Access Control** (Primary)
```solidity
// Example: Premium DAO requires 3+ verifications
function vote() external minTrustScore(3) {
    // Only highly trusted humans can vote
}
```

#### **2. Governance**
- Vote on new adapter additions
- Vote on protocol parameters
- Vote on treasury allocation

#### **3. Reputation Transfer**
```solidity
// I vouch for Alice by burning my HMT
function vouch(address alice) external {
    hmt.burn(msg.sender, 1 ether);
    oracle.boostTrustScore(alice, 1);
}
```

#### **4. Staking** (Future)
- Lock HMT → boost trust score
- Lock HMT → earn verification fees
- Lock HMT → become validator

---

### Token Distribution

**Max Supply: 8,000,000,000 HMT** (world population cap)

| Allocation | Amount | Vesting | Purpose |
|------------|--------|---------|---------|
| **User Rewards** | 60% (4.8B) | On verification | 1 HMT per verification |
| **Protocol Treasury** | 20% (1.6B) | 4 years | Development, partnerships |
| **Team** | 10% (800M) | 4 years, 1yr cliff | Core contributors |
| **Early Backers** | 5% (400M) | 2 years | Seed investors |
| **Liquidity** | 5% (400M) | Immediate | DEX liquidity |

**Emission Schedule:**
- Year 1: ~100M HMT (10k verifications/day avg)
- Year 5: ~1B HMT (1M verifications/day)
- Year 20: ~4.8B HMT (all distributed)

**Deflationary Mechanisms:**
- Vouch system burns tokens
- Premium features burn tokens
- Governance proposals require burn

---

## 📈 Revenue Streams (5-Year Vision)

### Year 1-2: **Developer SaaS** (Primary)
- 100 paying projects @ $299/mo = $30k MRR
- 1,000 paying projects @ avg $200/mo = $200k MRR (Year 2)
- **Target: $2.4M ARR by Year 2**

### Year 2-3: **Enterprise Partnerships**
- Binance: Revenue share on 500M users → $X per verification
- Coinbase: White-label solution for Verification API
- Epic Games / Roblox: Custom anti-cheat integration
- **Target: $10M+ in partnership deals**

### Year 3-5: **Token Value Capture**
- HMT listed on CEXs
- Treasury holds 20% = passive appreciation
- Governance fees (burn-to-vote model)
- **Target: $100M+ token treasury value**

### Bonus: **Infrastructure Provider**
- Other L2s pay us to deploy
- Cross-chain bridge fees
- API access for Web2 companies
- **Target: $5M+ ancillary revenue**

---

## 🎪 Go-To-Market Strategy

### Phase 1: **Hackathon → Proof of Concept** (Now)
**Goal:** Working product, 2-3 verification sources, docs

**Deliverables:**
- ✅ Smart contracts on Base Sepolia + Status Network
- ✅ Gitcoin + BrightID adapters working
- ✅ Backend oracle signing service
- ✅ Integration documentation
- ✅ Demo frontend

**Success Metric:** Win hackathon, get 5+ devs interested

---

### Phase 2: **GameFi Blitz** (Month 1-3)
**Goal:** First 10 paying customers

**Strategy:**
1. **Outreach:** DM 100 GameFi projects on Twitter
2. **Offer:** Free integration + 3 months free SaaS
3. **Deliver:** White-glove integration support (we do it for them)
4. **Convert:** After 3 months → $99/mo Starter tier

**Target Projects:**
- Axie Infinity (anti-bot in breeding)
- Gods Unchained (fair tournament entry)
- Illuvium (airdrop protection)
- New GameFi launches (critical need from day 1)

**Success Metric:** 10 live integrations, 10k verified users

---

### Phase 3: **CEX Partnership Play** (Month 3-6)
**Goal:** Unlock 500M+ KYC'd users

**Pitch to Binance/Coinbase:**
> "You have 500M users who passed KYC. They want to use Web3.  
> Let them prove KYC on-chain (privacy-preserving) via our protocol.  
> We drive Web3 adoption, you retain users, we revenue share."

**Partnership Structure:**
- We build BinanceAdapter
- Binance users opt-in to on-chain verification
- We pay Binance $X per verification
- Both win: we get massive TAM, they get Web3 engagement

**Success Metric:** 1 CEX partnership signed, 100k+ CEX users verified

---

### Phase 4: **Scale & Network Effects** (Month 6-12)
**Goal:** Become THE standard for Web3 identity

**Expansion:**
1. **More Chains:** Optimism, Arbitrum, Polygon (6+ chains)
2. **More Adapters:** ENS, Lens, Farcaster, BrightID, etc (10+ sources)
3. **More Customers:** 100+ dApps, 1M+ verified users
4. **Token Launch:** CEX listings, liquidity mining

**Network Effects:**
- More dApps → more users need verification
- More verified users → more dApps want integration
- More sources → more trust in the system

**Success Metric:** $2M+ ARR, 1M+ verified users, HMT on Binance/Coinbase

---

## 💎 Why This Works (Thesis)

### 1. **Real Problem, Proven Losses**
- $1B+/year stolen by Sybil bots (GameFi alone)
- Every airdrop = 60-90% farming (documented)
- Governance attacks frequent (Compound, Uniswap)

### 2. **Massive TAM, Underserved**
- 10,000+ active dApps (Ethereum + L2s)
- 500M+ CEX users (already KYC'd, want Web3)
- Every new project needs this (TAM growing daily)

### 3. **"Stripe Moment" = Clear Path to Dominance**
- First mover in aggregation layer
- Network effects (more sources = more valuable)
- Switching costs (integrated once = sticky)

### 4. **Token Aligns Incentives**
- Users earn HMT (get paid to verify)
- Projects use HMT (creates demand)
- We hold 20% treasury (value capture)

### 5. **Execution Advantage**
- Working code TODAY (not vaporware)
- Clear partnerships (Binance/Coinbase = obvious next step)
- Strong team (Solidity + growth + BD)

---

## 🚀 Traction Milestones

### Hackathon Success = Product Validation
- ✅ Working smart contracts
- ✅ 2-3 verification sources
- ✅ Full integration docs
- ✅ "Wow" demo

### Month 3 = Customer Validation
- 🎯 10 live dApp integrations
- 🎯 10k+ verified users
- 🎯 $3k MRR (10 customers @ $299/mo)

### Month 6 = Market Validation  
- 🎯 1 CEX partnership
- 🎯 100k+ verified users
- 🎯 $30k MRR (100+ customers)

### Month 12 = Category Leader
- 🎯 100+ dApp integrations
- 🎯 1M+ verified users
- 🎯 $200k MRR
- 🎯 HMT token launched on CEX

---

## 🎯 Investment Thesis (If Fundraising)

**Seed Round: $2M @ $10M valuation**

### Use of Funds:
- 40% Engineering (3 Solidity devs, 2 full-stack)
- 30% BD/Partnerships (close CEX deals)
- 20% Marketing (developer relations, hackathons)
- 10% Legal/Ops (token launch, entity setup)

### 5-Year Vision:
- Year 5 revenue: $50M+ ARR
- Year 5 users: 10M+ verified humans
- Exit multiple: 10x ARR = $500M+ acquisition by Coinbase/Binance
- Or: Token value $1B+ (unicorn status)

**Returns:**
- Seed investors @ $10M → Exit @ $500M = **50x return**
- Or token appreciation: $10M → $1B = **100x return**

---

## 🛡️ Risk Mitigation

### Risk: "What if Gitcoin/Worldcoin build this?"
**Mitigation:** They're sources, not aggregators. They want distribution (we give it to them). Plus, first-mover advantage + network effects = moat.

### Risk: "Regulatory crackdown on KYC"
**Mitigation:** We're privacy-preserving (no PII on-chain). We work WITH regulators, not against them. CEX partnerships = compliance built-in.

### Risk: "Users don't want to verify"
**Mitigation:** We PAY them (1 HMT token). Plus, accessing premium dApps = clear value prop.

### Risk: "Low developer adoption"
**Mitigation:** One-line integration = lowest friction possible. Free tier + white-glove onboarding in Phase 2.

---

## 📞 Contact & Next Steps

**Post-Hackathon:**
1. Reach out to 50 GameFi projects (BD)
2. Apply to Binance Labs / Coinbase Ventures
3. Deploy on 3+ chains (Optimism, Arbitrum, Polygon)
4. Add 5+ more verification sources

**Partnership Opportunities:**
- CEX integrations (Binance, Coinbase, Kraken)
- GameFi collaborations (Axie, Illuvium, etc)
- Infrastructure partnerships (Alchemy, QuickNode)

---

**TL;DR:** We're Stripe for Web3 identity. $1B+ problem (Sybil attacks), 10k+ customers (dApps), clear GTM (GameFi → CEX partnerships → scale). Working product, massive TAM, first-mover advantage.

**Competitive Moat:** We aggregate all verification sources. Gitcoin/Worldcoin are our PARTNERS, not competitors. Network effects = winner-take-most market.

**Ask:** Win hackathon → raise $2M seed → 10 GameFi customers → 1 CEX deal → category leader in 12 months. 🚀

