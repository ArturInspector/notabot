# 🎬 NotABot Demo Script (2 minutes)

## Scene 1: The Problem (20 seconds)

**Визуал:** Статистика на экране
```
❌ 60-90% of airdrop participants = BOTS
❌ $1B+ stolen by Sybil attacks every year
❌ Developers waste 2-3 weeks integrating verification
```

**Голос:**
> "Web3 has a bot problem. Airdrops are stolen. GameFi is ruined. And developers spend weeks integrating 5 different verification systems."

---

## Scene 2: The Solution (30 seconds)

**Визуал:** NotABot landing page
```
┌─────────────────────────────────────┐
│  NotABot - Stripe for Web3 Identity │
│                                     │
│  One API ⟶ Every Proof-of-Humanity │
│                                     │
│  [Worldcoin] [Gitcoin] [PoH] [...]  │
└─────────────────────────────────────┘
```

**Голос:**
> "Introducing NotABot - the universal proof-of-humanity aggregator. Users verify once through any provider - Worldcoin, Gitcoin Passport, Proof of Humanity, or BrightID. Then every dApp recognizes them."

---

## Scene 3: User Flow (40 seconds)

**Визуал:** Live demo

**Step 1:** Connect wallet
```
[Connect Wallet] ➜ Wallet connected: 0x123...
```

**Step 2:** Choose verification
```
✓ Worldcoin (ZK proof, on-chain)
✓ Gitcoin Passport (score-based)
✓ Proof of Humanity
✓ BrightID
```

**Step 3:** Verify
```
[Verify with Gitcoin] ➜ Loading...
✅ Verified! 1 HMT minted
TX: 0xabc...def
```

**Step 4:** Check status
```
Dashboard:
✅ Verified Human
Trust Score: 1 HMT
```

**Голос:**
> "Alice connects her wallet, chooses Gitcoin Passport, and clicks verify. In seconds, she's verified on-chain. Now she can access any dApp that uses NotABot - no re-verification needed."

---

## Scene 4: Developer Integration (20 seconds)

**Визуал:** Code editor

```solidity
// Before: 2-3 weeks of integration
// ❌ Worldcoin SDK
// ❌ Gitcoin API  
// ❌ Custom anti-Sybil logic

// After: 5 minutes
contract MyAirdrop {
    IHumanityOracle oracle;
    
    function claim() external {
        require(oracle.isVerifiedHuman(msg.sender));
        // ✅ Done!
    }
}
```

**Голос:**
> "For developers? One line of code. That's it. No SDKs, no API keys, just pure on-chain verification."

---

## Scene 5: The Impact (10 seconds)

**Визуал:** Benefits grid
```
✅ Verify once, use everywhere
✅ 5-minute integration
✅ $0.001 per verification (Base L2)
✅ Privacy-preserving
✅ Open & composable
```

**Голос:**
> "NotABot - making Web3 human again."

---

## Recording Checklist

Before recording:
- [ ] Backend running (Railway/localhost)
- [ ] Frontend deployed (Vercel)
- [ ] Test wallet with ETH на Base Sepolia
- [ ] Demo mode enabled (`DEMO_MODE=true`)
- [ ] BaseScan tab ready (show TX)

During recording:
- [ ] Clear browser cache (clean demo)
- [ ] Screen recorder ready (OBS/Loom)
- [ ] Microphone test
- [ ] No notifications (DND mode)

After recording:
- [ ] Upload to YouTube (unlisted)
- [ ] Add to README
- [ ] Add to submission form

---

## Backup Talking Points

If demo fails:
1. **"Let me show you the contracts on BaseScan"**
   - Open 0x8Cec9277d761f947e29EBeACc4035DDCDB10c2BD
   - Show Read Contract functions
   - Show recent transactions

2. **"Here's the integration code"**
   - Show INTEGRATION.md
   - Highlight 1-line require statement

3. **"And here are our test results"**
   - Show test output (26/26 passing)
   - Show gas costs

---

## Key Metrics to Mention

- **4 verification sources** (Worldcoin, Gitcoin, PoH, BrightID)
- **$0.001 per verification** (Base L2 gas costs)
- **5 minutes** integration time
- **26/26 tests** passing
- **Base Sepolia** deployed and live

---

## Submission Highlights

**Problem:**
> Sybil attacks cost $1B+/year. Developers waste weeks integrating verification.

**Solution:**
> Universal proof-of-humanity API. Verify once, use everywhere.

**Tech:**
> Solidity + Hardhat on Base L2. ECDSA + ZK proofs. OpenZeppelin security.

**Traction:**
> Live on Base Sepolia. 4 adapters. Demo mode ready. Integration guide complete.

**Vision:**
> Become the Stripe of Web3 identity. Every dApp uses NotABot for anti-Sybil.

