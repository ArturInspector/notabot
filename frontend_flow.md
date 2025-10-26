# Frontend Integration Flow
**NotABot - Как фронтенд работает с подписями бэкенда**

---

## 🎯 Главная идея

```
Frontend (MetaMask) → Backend (verify + sign) → Frontend (encode) → Smart Contract (verify)
```

Бэкенд проверяет верификацию (Gitcoin API, PoH, BrightID) и **подписывает данные** своим приватным ключом.  
Фронтенд получает подпись, кодирует в `bytes` и отправляет в контракт.  
Контракт проверяет, что подпись от доверенного оракла → минтит токен.

---

## 📝 Gitcoin Passport Flow

### Шаг 1: Получить подпись от бэкенда

```javascript
const userAddress = await signer.getAddress(); // MetaMask адрес

const response = await fetch('http://localhost:3001/api/gitcoin/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userAddress })
});

const { data } = await response.json();
// data = { userId, score, timestamp, signature, backendAddress }
```

**Backend response:**
```json
{
  "success": true,
  "data": {
    "userId": "0xabc...def",
    "score": 75,
    "timestamp": 1729872000,
    "signature": "0x123abc...",
    "expiresAt": 1729875600,
    "backendAddress": "0x..."
  }
}
```

### Шаг 2: Закодировать proof (ABI encode)

```javascript
const proof = ethers.AbiCoder.defaultAbiCoder().encode(
  ['bytes32', 'uint256', 'uint256', 'bytes'],
  [data.userId, data.score, data.timestamp, data.signature]
);
```

### Шаг 3: Отправить в контракт

```javascript
import GitcoinAdapterABI from './abis/GitcoinAdapter.json';

const gitcoinAdapter = new ethers.Contract(
  GITCOIN_ADAPTER_ADDRESS,
  GitcoinAdapterABI,
  signer
);

const tx = await gitcoinAdapter.verifyAndRegister(userAddress, proof);
await tx.wait();

console.log('✅ Verified! Got 1 HMT token');
```

---

## 🌐 Worldcoin Flow (без бэкенда!)

Worldcoin - **полностью on-chain**, бэкенд не нужен!  
Используй `@worldcoin/idkit` в React.

### Шаг 1: Установка IDKit

```bash
npm install @worldcoin/idkit
```

### Шаг 2: Интеграция в React

```jsx
import { IDKit, ISuccessResult } from '@worldcoin/idkit';

function WorldcoinVerifyButton() {
  const handleVerify = async (result: ISuccessResult) => {
    // 1. Encode proof (другой формат!)
    const proof = ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint256', 'uint256', 'uint256[8]'],
      [result.merkle_root, result.nullifier_hash, result.proof]
    );
    
    // 2. Отправить напрямую в контракт
    const worldcoinAdapter = new ethers.Contract(
      WORLDCOIN_ADAPTER_ADDRESS,
      WorldcoinAdapterABI,
      signer
    );
    
    const tx = await worldcoinAdapter.verifyAndRegister(userAddress, proof);
    await tx.wait();
    
    console.log('✅ Worldcoin verified! Got 1 HMT token');
  };
  
  return (
    <IDKit
      app_id="app_staging_123..." // Твой World ID App ID
      action="verify-human"
      onSuccess={handleVerify}
    >
      {({ open }) => <button onClick={open}>Verify with Worldcoin</button>}
    </IDKit>
  );
}
```

**Ключевое отличие:**  
- ❌ Нет запроса к бэкенду  
- ✅ Proof сразу из IDKit → в контракт  
- ✅ Контракт сам проверяет ZK-proof через `IWorldID.verifyProof()`

---

## 📊 Сравнение: Backend vs On-Chain

| Сервис | Backend API? | Proof Format | Encoding |
|--------|-------------|--------------|----------|
| **Gitcoin** | ✅ Да | `userId + score + timestamp + signature` | `['bytes32', 'uint256', 'uint256', 'bytes']` |
| **BrightID** | ✅ Да | `contextId + timestamp + signature` | `['bytes32', 'uint256', 'bytes']` |
| **Worldcoin** | ❌ Нет | `merkle_root + nullifier + zkProof[8]` | `['uint256', 'uint256', 'uint256[8]']` |

---

## 🔐 Что проверяет контракт?

### Gitcoin/BrightID (ECDSA подпись)
```solidity
// GitcoinAdapter.sol
bytes32 message = keccak256(abi.encodePacked(user, userId, score, timestamp));
bytes32 ethSignedHash = message.toEthSignedMessageHash();
require(ethSignedHash.recover(signature) == backendOracle, "Invalid signature");
```

### Worldcoin (ZK-proof)
```solidity
// WorldcoinAdapter.sol
worldId.verifyProof(
    root,
    groupId,
    abi.encodePacked(user).hashToField(),
    nullifierHash,
    externalNullifierHash,
    zkProof
);
```

---

## 💡 Полный пример: Gitcoin + Worldcoin

```jsx
import { useState } from 'react';
import { ethers } from 'ethers';
import { IDKit } from '@worldcoin/idkit';

function VerifyPage() {
  const [signer, setSigner] = useState(null);
  
  // Подключение MetaMask
  const connectWallet = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    setSigner(await provider.getSigner());
  };
  
  // Gitcoin верификация
  const verifyGitcoin = async () => {
    const address = await signer.getAddress();
    
    const res = await fetch('http://localhost:3001/api/gitcoin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAddress: address })
    });
    
    const { data } = await res.json();
    const proof = ethers.AbiCoder.defaultAbiCoder().encode(
      ['bytes32', 'uint256', 'uint256', 'bytes'],
      [data.userId, data.score, data.timestamp, data.signature]
    );
    
    const adapter = new ethers.Contract(GITCOIN_ADAPTER_ADDRESS, ABI, signer);
    const tx = await adapter.verifyAndRegister(address, proof);
    await tx.wait();
    alert('✅ Gitcoin verified!');
  };
  
  // Worldcoin верификация
  const handleWorldcoin = async (result) => {
    const address = await signer.getAddress();
    const proof = ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint256', 'uint256', 'uint256[8]'],
      [result.merkle_root, result.nullifier_hash, result.proof]
    );
    
    const adapter = new ethers.Contract(WORLDCOIN_ADAPTER_ADDRESS, ABI, signer);
    const tx = await adapter.verifyAndRegister(address, proof);
    await tx.wait();
    alert('✅ Worldcoin verified!');
  };
  
  return (
    <div>
      <button onClick={connectWallet}>Connect Wallet</button>
      <button onClick={verifyGitcoin}>Verify with Gitcoin</button>
      
      <IDKit
        app_id="app_staging_..."
        action="verify-human"
        onSuccess={handleWorldcoin}
      >
        {({ open }) => <button onClick={open}>Verify with Worldcoin</button>}
      </IDKit>
    </div>
  );
}
```

---

## ⚠️ Важные моменты

1. **Proof validity**: Gitcoin/BrightID подписи действуют 1 час (`PROOF_VALIDITY`)
2. **One-time use**: Каждый `userId`/`nullifierHash` можно использовать только раз
3. **Gas cost**: ~0.0001 ETH на Base L2 (<$0.01)
4. **Reward**: Каждая верификация = +1 HMT токен
5. **Trust Score**: `getTrustScore(address)` = количество HMT токенов

---

**Questions?** See `packages/backend/API.md` for full API docs.