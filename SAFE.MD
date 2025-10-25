# Security Architecture - HumanityOracle

## Verification Patterns

### 1. On-Chain Registry Check (Proof of Humanity)
**Security Level:** High
- Query existing PoH registry directly on-chain
- No backend required, fully trustless
- Pattern: `require(pohRegistry.isRegistered(address))`

### 2. Zero-Knowledge Proof (Worldcoin)
**Security Level:** Very High (Biometric)
```solidity
IWorldID.verifyProof(root, groupId, signal, nullifierHash, externalNullifier, proof);
```
- Nullifier prevents duplicate verifications
- ZK proof = privacy-preserving
- On-chain verification via World ID Router

### 3. Signed Off-Chain Data (Gitcoin Passport)
**Security Level:** Medium (Reputation-based)
```solidity
bytes32 message = keccak256(abi.encodePacked(user, userId, score, timestamp));
require(ECDSA.recover(message.toEthSignedMessageHash(), signature) == backendOracle);
```
- Backend fetches Gitcoin score via API
- Signs with ECDSA (EIP-191)
- Contract verifies signature on-chain

---

## Anti-Sybil Protections

### Duplicate Prevention
```solidity
mapping(bytes32 => bool) public usedUniqueIds;  // Cross-source deduplication
mapping(uint256 => bool) public usedNullifiers; // Worldcoin nullifiers
```

### Replay Attack Protection
- Timestamp window: 1 hour max
- Proof expiry check: `require(block.timestamp <= timestamp + VALIDITY_PERIOD)`
- Single-use proofs: `require(!usedProofs[proofHash])`

---

## Backend API Security (Gitcoin Adapter)

### Endpoint: `POST /api/gitcoin/verify/:address`

**Flow:**
1. Backend queries Gitcoin Passport API
2. Validates score >= 20 threshold
3. Signs payload: `sign(user, userId, score, timestamp)`
4. Returns signature to frontend
5. Frontend submits to `GitcoinAdapter.verifyAndRegister()`

**Security Measures:**
- Rate limiting: 100 req/min per IP
- API key rotation (Gitcoin)
- Oracle wallet isolation (separate from deployer)
- No raw data storage (only hashes on-chain)

---

## Access Control

### Role-Based Permissions
```solidity
AccessControl:
  - DEFAULT_ADMIN_ROLE: Owner (contract deployment/pausing)
  - MINTER_ROLE: MainAggregator only (mint tokens/SBTs)
  
Owner-only functions:
  - addAdapter(address, sourceId)
  - pause()/unpause()
  
Adapter-only:
  - registerVerification(user, source, uniqueId, proof)
```

---

## Gas Optimization

**Target Costs (Base L2 @ 0.1 gwei):**
- Worldcoin verification: ~150k gas = $0.003
- Gitcoin verification: ~120k gas = $0.002
- isVerifiedHuman() view: FREE (view function)

**Optimizations:**
- `immutable` for addresses (SLOAD → cheaper)
- Batch operations where possible
- Minimal storage (1 SBT = permanent proof)