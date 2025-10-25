# HumanityOracle Integration Guide
**"Stripe for Web3 Identity" - Developer Integration Manual**

> **Метафора**: Представь, что ты хочешь добавить "Sign in with Google" на свой сайт. Ты просто добавляешь кнопку, пользователь нажимает, авторизуется через Google, и ты получаешь подтверждение. HumanityOracle работает точно так же, но вместо "это настоящий Google аккаунт" ты получаешь "это настоящий человек, подтвержденный через Worldcoin/Gitcoin/другие сервисы".

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Partner Integration (Frontend Button)](#partner-integration)
3. [User Verification Flow](#user-verification-flow)
4. [JavaScript SDK (Plug & Play)](#javascript-sdk)
5. [Backend Service Signatures](#backend-service-signatures)
6. [Advanced: Smart Contract Integration](#smart-contract-integration)

---

## Architecture Overview

### Three-Layer Model

```
┌─────────────────────────────────────────────────────────┐
│  PARTNER APP (Твой игровой сервис, DeFi, NFT маркетплейс) │
│  "Нам нужна защита от ботов"                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ ① Check: isHuman(address)
                 │    ↓
┌────────────────▼────────────────────────────────────────┐
│  HUMANITY ORACLE - AGGREGATOR (Base L2)                 │
│  ✓ Public read function: getVerificationStatus()        │
│  ✓ Backend API: POST /verify-with-worldcoin             │
│  ✓ Frontend Widget: <HumanityButton />                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ ② Aggregate from sources
                 │    ↓
┌────────────────▼────────────────────────────────────────┐
│  VERIFICATION SOURCES (Worldcoin, Gitcoin Passport...)  │
│  "Proof of Humanity данные"                             │
└─────────────────────────────────────────────────────────┘
```

**Ключевая идея**: Ты не интегрируешь Worldcoin напрямую. Ты интегрируешь **один** HumanityOracle, который внутри уже интегрировал ВСЕ proof-of-humanity сервисы.

---

## Partner Integration
### Тема 1: Как добавить "Sign in as Human" на свой сайт

### Простейший сценарий (On-Chain Check)

**Цель**: Игра хочет пускать только верифицированных людей в premium лобби.

#### Smart Contract Integration (Рекомендуется)

```solidity
// В твоём игровом контракте
import "./interfaces/IHumanityOracle.sol";

contract MyGame {
    IHumanityOracle public humanityOracle;
    
    constructor(address _oracleAddress) {
        humanityOracle = IHumanityOracle(_oracleAddress);
    }
    
    modifier onlyHuman() {
        require(
            humanityOracle.isVerified(msg.sender),
            "Not verified as human"
        );
        _;
    }
    
    function joinPremiumLobby() external onlyHuman {
        // Только верифицированные люди попадают сюда
        // Боты автоматически реверт получат
    }
}
```

**Что происходит под капотом:**
1. Игрок вызывает `joinPremiumLobby()`
2. Модификатор `onlyHuman` делает call на `humanityOracle.isVerified(address)`
3. HumanityOracle читает on-chain mapping: `address => VerificationStatus`
4. Если `status.isValid == true` → ✅ пропускаем
5. Если нет → ❌ revert с сообщением

**Gas cost**: ~2-3k gas (просто SLOAD операция)

---

#### Frontend Widget Integration (JavaScript SDK)

Для сайтов БЕЗ смарт-контрактов (например, обычный web2 игровой сайт с web3 авторизацией):

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.humanityoracle.io/widget-v1.js"></script>
</head>
<body>
    <div id="login-section">
        <!-- Вместо "Connect Wallet" добавляем "Verify as Human" -->
        <button id="humanity-verify-btn">
            🤖→👤 Verify I'm Human
        </button>
    </div>

    <script>
        const humanity = new HumanityOracle({
            network: 'base',
            appId: 'your-app-id-here' // Получаешь после регистрации
        });

        document.getElementById('humanity-verify-btn').addEventListener('click', async () => {
            try {
                const result = await humanity.checkVerification(userAddress);
                
                if (result.isVerified) {
                    console.log('✅ User is human!');
                    console.log('Sources:', result.sources); // ['worldcoin', 'gitcoin']
                    enablePremiumFeatures();
                } else {
                    console.log('❌ Not verified, redirecting to verification flow...');
                    await humanity.startVerification(userAddress);
                }
            } catch (error) {
                console.error('Verification error:', error);
            }
        });
    </script>
</body>
</html>
```

**Что делает SDK:**
1. Проверяет on-chain статус через Web3 provider (читает базу контракт)
2. Если не верифицирован → открывает модальное окно с опциями верификации
3. После верификации → автоматически обновляет статус

---

#### REST API для Backend Проверки

Если твой backend хочет проверить статус БЕЗ Web3:

```bash
curl -X GET "https://api.humanityoracle.io/v1/verification/0xYourAddress" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Response:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "isVerified": true,
  "verificationLevel": "high",
  "sources": [
    {
      "name": "worldcoin",
      "verified": true,
      "timestamp": 1729864800,
      "credibilityScore": 95
    },
    {
      "name": "gitcoin_passport",
      "verified": true,
      "timestamp": 1729864200,
      "credibilityScore": 78
    }
  ],
  "aggregatedScore": 87,
  "lastUpdated": 1729864800,
  "expiresAt": null
}
```

**Use case**: Твой Node.js/Python backend получает запрос от пользователя, проверяет через наш API, и решает дать ли доступ.

---

### Метафора: "Вышибала в клубе"

Представь, что HumanityOracle - это **вышибала перед ночным клубом**:

- **Smart Contract Integration** = вышибала стоит прямо у входа в клуб (твой контракт). Каждый гость (transaction) проходит проверку паспорта (isVerified check) перед входом.
  
- **Frontend Widget** = Онлайн-проверка перед тем как ехать в клуб. Сайт клуба показывает: "Проверьте, можете ли вы войти" → если нет паспорта, отправляет оформить.

- **REST API** = Звонок вышибале перед посещением. Backend спрашивает: "Этот человек в whitelist?" → получает ответ да/нет.

**Все три метода читают ОДИН источник правды** - on-chain mapping в MainAggregator контракте.

---

## User Verification Flow
### Тема 2: Что происходит, когда пользователь НЕ верифицирован

### Step-by-Step Journey

#### 1️⃣ Обнаружение (Detection)

Пользователь приходит на твой сайт/игру и пытается использовать защищенную функцию:

```javascript
// В твоём frontend коде
async function accessPremiumFeature(userAddress) {
    const humanity = new HumanityOracle({ network: 'base' });
    const status = await humanity.isVerified(userAddress);
    
    if (!status.isVerified) {
        // ❌ Не верифицирован - перенаправляем
        showVerificationModal();
    } else {
        // ✅ Верифицирован - даем доступ
        grantAccess();
    }
}
```

---

#### 2️⃣ Перенаправление (Redirect to Verification)

**Вариант A: Модальное окно (Рекомендуется для UX)**

SDK открывает встроенное модальное окно прямо на твоём сайте:

```javascript
await humanity.startVerification(userAddress, {
    mode: 'modal', // Открывает popup на месте
    onSuccess: (result) => {
        console.log('Verification completed!', result);
        refreshUserStatus();
    },
    onCancel: () => {
        console.log('User cancelled verification');
    }
});
```

**Что видит пользователь:**

```
┌──────────────────────────────────────────────┐
│  🤖 Verify You're Human                      │
├──────────────────────────────────────────────┤
│  Choose verification method:                 │
│                                              │
│  ┌────────────────────────────────┐         │
│  │  🌐 Worldcoin                  │         │
│  │  "Scan iris with Orb"          │  [→]   │
│  └────────────────────────────────┘         │
│                                              │
│  ┌────────────────────────────────┐         │
│  │  🛂 Gitcoin Passport           │         │
│  │  "Connect verified accounts"    │  [→]   │
│  └────────────────────────────────┘         │
│                                              │
│  ┌────────────────────────────────┐         │
│  │  🧑‍⚖️ Proof of Humanity          │         │
│  │  "Video verification"           │  [→]   │
│  └────────────────────────────────┘         │
│                                              │
│  [Cancel]                                   │
└──────────────────────────────────────────────┘
```

**Вариант B: Полное перенаправление**

```javascript
// Перенаправляет на наш hosted frontend
window.location.href = `https://verify.humanityoracle.io?
    address=${userAddress}&
    returnUrl=${encodeURIComponent(window.location.href)}&
    appId=your-app-id`;
```

После верификации пользователь возвращается на `returnUrl` с параметром `?verified=true`.

---

#### 3️⃣ Выбор метода верификации (User Choice)

Пользователь выбирает **Worldcoin** (например). Что происходит дальше:

##### Frontend → Backend Communication

```javascript
// 1. Frontend: Пользователь прошел Worldcoin verification на их сайте
// Worldcoin вернул proof (nullifier_hash, merkle_root, proof)

const worldcoinProof = {
    merkle_root: "0x1234...",
    nullifier_hash: "0x5678...",
    proof: "0xabcd...",
    verification_level: "orb"
};

// 2. Отправляем proof на НАШ backend
const response = await fetch('https://api.humanityoracle.io/v1/verify/worldcoin', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-App-Id': 'your-app-id'
    },
    body: JSON.stringify({
        userAddress: "0x742d35Cc...",
        proof: worldcoinProof,
        signedMessage: await signVerificationRequest(userAddress) // Подпись кошелька
    })
});
```

##### Backend Processing (Service Signature)

**Наш Backend Service** получает запрос и делает следующее:

```javascript
// Backend Node.js/Python псевдокод
async function processWorldcoinVerification(request) {
    // Step 1: Validate signature
    const isValidSignature = verifyEthereumSignature(
        request.signedMessage,
        request.userAddress
    );
    if (!isValidSignature) throw new Error('Invalid signature');
    
    // Step 2: Verify proof with Worldcoin API
    const worldcoinResponse = await fetch('https://developer.worldcoin.org/api/v1/verify', {
        method: 'POST',
        body: JSON.stringify({
            nullifier_hash: request.proof.nullifier_hash,
            merkle_root: request.proof.merkle_root,
            proof: request.proof.proof,
            action: 'humanity-oracle-verification'
        })
    });
    
    if (!worldcoinResponse.success) {
        throw new Error('Worldcoin verification failed');
    }
    
    // Step 3: Create on-chain record (SERVICE SIGNATURE)
    // Backend владеет private key с ролью ADAPTER_ROLE в MainAggregator
    const tx = await mainAggregatorContract.registerVerification(
        request.userAddress,
        'worldcoin',
        worldcoinResponse.verification_level,
        { gasLimit: 100000 }
    );
    
    await tx.wait();
    
    // Step 4: Return success
    return {
        success: true,
        transactionHash: tx.hash,
        verificationId: generateId(),
        timestamp: Date.now()
    };
}
```

**Service Signature ключевой момент:**

Backend имеет **authorized роль** в смарт-контракте:

```solidity
// MainAggregator.sol
mapping(address => bool) public authorizedAdapters;

function registerVerification(
    address user,
    string memory source,
    uint8 level
) external onlyAuthorizedAdapter {
    // Только backend с ADAPTER_ROLE может вызвать
    verifications[user][source] = VerificationData({
        isValid: true,
        level: level,
        timestamp: block.timestamp
    });
    emit VerificationRegistered(user, source);
}
```

Backend подписывает транзакцию своим ключом → записывает on-chain → пользователь теперь верифицирован.

---

#### 4️⃣ Возврат и обновление статуса

После успешной верификации:

```javascript
// Frontend автоматически перепроверяет статус
const newStatus = await humanity.isVerified(userAddress);
console.log(newStatus); // { isVerified: true, sources: ['worldcoin'], ... }

// Обновляем UI
showSuccessMessage('✅ You are now verified!');
enablePremiumFeatures();
```

---

### Метафора: "Получение водительских прав"

1. **Обнаружение**: Ты хочешь взять машину в аренду (использовать игру), но у тебя нет прав (верификации).

2. **Перенаправление**: Компания аренды отправляет тебя в ГИБДД (наш frontend верификации).

3. **Выбор метода**: В ГИБДД ты выбираешь, где проходить экзамен - в школе А, Б или В (Worldcoin, Gitcoin, PoH).

4. **Backend обработка**: Школа проверяет тебя, отправляет результат в ГИБДД, ГИБДД записывает в базу "у этого человека есть права".

5. **Возврат**: Ты возвращаешься в компанию аренды с правами - они проверяют базу ГИБДД (on-chain) и дают машину.

**Критично**: Компания аренды (партнерский сайт) НИКОГДА не общается со школой (Worldcoin) напрямую. Вся логика через ГИБДД (HumanityOracle).

---

## JavaScript SDK
### Тема 3: Plug & Play решение для максимального UX

### Vision: One-Line Integration

Цель - сделать интеграцию настолько простой, что разработчик может добавить проверку человечности за 5 минут.

### SDK Architecture

```javascript
// humanity-oracle-sdk.js (упрощенная версия)

class HumanityOracle {
    constructor(config) {
        this.network = config.network || 'base';
        this.appId = config.appId;
        this.contractAddress = DEPLOYED_ADDRESSES[this.network];
        this.provider = new ethers.JsonRpcProvider(RPC_URLS[this.network]);
        this.contract = new ethers.Contract(
            this.contractAddress,
            ABI,
            this.provider
        );
    }
    
    // Основные методы
    async isVerified(address) {
        const result = await this.contract.isVerified(address);
        return {
            isVerified: result,
            sources: await this.getVerificationSources(address),
            timestamp: Date.now()
        };
    }
    
    async startVerification(address, options = {}) {
        if (options.mode === 'modal') {
            return this._showModal(address);
        } else {
            return this._redirect(address, options.returnUrl);
        }
    }
    
    async getVerificationSources(address) {
        // Читает все адаптеры и возвращает массив источников
        const adapters = ['worldcoin', 'gitcoin', 'poh'];
        const results = await Promise.all(
            adapters.map(a => this.contract.getAdapterVerification(address, a))
        );
        return adapters.filter((_, i) => results[i].isValid);
    }
    
    // Private methods для UI
    _showModal(address) {
        // Создает iframe с нашим hosted frontend
        const modal = document.createElement('div');
        modal.className = 'humanity-oracle-modal';
        modal.innerHTML = `
            <iframe src="https://verify.humanityoracle.io/embed?address=${address}&appId=${this.appId}">
            </iframe>
        `;
        document.body.appendChild(modal);
        
        return new Promise((resolve, reject) => {
            window.addEventListener('message', (event) => {
                if (event.data.type === 'VERIFICATION_COMPLETE') {
                    modal.remove();
                    resolve(event.data.result);
                }
            });
        });
    }
}
```

---

### Usage Examples

#### Example 1: NFT Minting Platform

```javascript
// Только верифицированные люди могут минтить NFT

async function mintNFT() {
    const humanity = new HumanityOracle({ network: 'base', appId: 'nft-platform' });
    const userAddress = await getCurrentWalletAddress();
    
    const { isVerified } = await humanity.isVerified(userAddress);
    
    if (!isVerified) {
        alert('Please verify you are human first!');
        await humanity.startVerification(userAddress, { mode: 'modal' });
        // После верификации пользователь может повторить попытку
        return;
    }
    
    // Proceed with minting
    await nftContract.mint();
}
```

#### Example 2: Airdrop Distribution

```javascript
// Backend проверяет верификацию перед отправкой токенов

app.post('/claim-airdrop', async (req, res) => {
    const { address, signature } = req.body;
    
    // Option A: On-chain check
    const humanity = new HumanityOracle({ network: 'base' });
    const status = await humanity.isVerified(address);
    
    // Option B: REST API check (если не хочешь Web3 в backend)
    const apiResponse = await fetch(`https://api.humanityoracle.io/v1/verification/${address}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    const status = await apiResponse.json();
    
    if (!status.isVerified) {
        return res.status(403).json({ error: 'Not verified as human' });
    }
    
    // Distribute airdrop
    await distributeTokens(address, AIRDROP_AMOUNT);
    res.json({ success: true });
});
```

---

### Browser Extension Possibility

**Да, можем сделать расширение!** По аналогии с MetaMask или WalletConnect.

#### Extension Architecture

```
┌─────────────────────────────────────────────┐
│  Browser Extension (Chrome/Firefox/Brave)   │
├─────────────────────────────────────────────┤
│  1. Автоматически детектирует, когда сайт  │
│     запрашивает humanity verification       │
│  2. Показывает popup: "Site X wants to     │
│     verify you're human"                    │
│  3. Кэширует статус верификации локально   │
│  4. Автоматически инжектит SDK в страницы  │
└─────────────────────────────────────────────┘
```

**Пример manifest.json:**

```json
{
  "name": "HumanityOracle Verifier",
  "version": "1.0.0",
  "manifest_version": 3,
  "permissions": ["storage", "activeTab"],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["injected-sdk.js"]
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html"
  }
}
```

**Content Script (injected-sdk.js):**

```javascript
// Автоматически инжектится на каждую страницу

window.addEventListener('load', () => {
    // Если на странице есть HumanityOracle SDK usage
    if (window.HumanityOracle) {
        console.log('🤖 HumanityOracle extension detected');
        
        // Перехватываем вызовы верификации
        const originalStartVerification = window.HumanityOracle.prototype.startVerification;
        window.HumanityOracle.prototype.startVerification = async function(address, options) {
            // Показываем extension popup вместо модального окна сайта
            const result = await chrome.runtime.sendMessage({
                type: 'START_VERIFICATION',
                address: address
            });
            return result;
        };
    }
});
```

**Преимущества расширения:**

✅ Пользователь верифицируется ОДИН раз → расширение кэширует статус  
✅ На любом сайте автоматически подставляется верификация  
✅ Единый UX на всех сайтах-партнерах  
✅ Можно добавить уведомления: "Your verification expires in 30 days"

---

## Backend Service Signatures
### Архитектура безопасности

### Why Service Signature?

**Проблема**: Если пользователь может напрямую вызывать `registerVerification()` в контракте, он может подделать верификацию.

**Решение**: Backend (доверенный сервис) имеет эксклюзивное право записывать верификации.

### Access Control Model

```solidity
// MainAggregator.sol
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MainAggregator is AccessControl {
    bytes32 public constant ADAPTER_ROLE = keccak256("ADAPTER_ROLE");
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function registerVerification(
        address user,
        string memory source,
        uint8 level
    ) external onlyRole(ADAPTER_ROLE) {
        // Only addresses with ADAPTER_ROLE can call
        _setVerification(user, source, level);
    }
    
    function grantAdapterRole(address adapter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ADAPTER_ROLE, adapter);
    }
}
```

### Backend Key Management

```javascript
// backend/config/keys.js
require('dotenv').config();

module.exports = {
    // Private key с ADAPTER_ROLE (хранится в .env)
    SERVICE_PRIVATE_KEY: process.env.SERVICE_PRIVATE_KEY,
    
    // Создаем wallet для подписи транзакций
    getServiceSigner: () => {
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        return new ethers.Wallet(process.env.SERVICE_PRIVATE_KEY, provider);
    }
};
```

```javascript
// backend/services/verificationService.js

async function recordVerificationOnChain(userAddress, source, level) {
    const signer = getServiceSigner();
    const contract = new ethers.Contract(
        MAIN_AGGREGATOR_ADDRESS,
        ABI,
        signer // Backend подписывает транзакцию
    );
    
    const tx = await contract.registerVerification(
        userAddress,
        source,
        level,
        { gasLimit: 100000 }
    );
    
    await tx.wait();
    return tx.hash;
}
```

### Security Best Practices

1. **Rate Limiting**: Не более 10 верификаций в минуту с одного IP
2. **Signature Verification**: Пользователь должен подписать запрос своим кошельком
3. **External API Validation**: ВСЕГДА проверяем proof через официальный API (Worldcoin, Gitcoin)
4. **Monitoring**: Логируем все транзакции, алертим на подозрительную активность
5. **Key Rotation**: Периодически меняем SERVICE_PRIVATE_KEY

---

## Advanced: Smart Contract Integration
### Для тех, кто хочет глубже

### Direct Contract Calls

Если твой проект уже on-chain (DeFi protocol, DAO), можно читать напрямую:

```solidity
interface IHumanityOracle {
    function isVerified(address user) external view returns (bool);
    function getVerificationLevel(address user, string memory source) external view returns (uint8);
    function getAggregatedScore(address user) external view returns (uint256);
}

contract MyDAO {
    IHumanityOracle public oracle;
    uint256 public constant MIN_HUMANITY_SCORE = 50;
    
    function proposeGovernance(string memory proposal) external {
        require(
            oracle.getAggregatedScore(msg.sender) >= MIN_HUMANITY_SCORE,
            "Insufficient humanity score"
        );
        
        // Create proposal
        _createProposal(msg.sender, proposal);
    }
    
    function vote(uint256 proposalId, bool support) external {
        require(oracle.isVerified(msg.sender), "Must be verified human");
        
        // Vote with sybil resistance
        _castVote(msg.sender, proposalId, support);
    }
}
```

### Gas Optimization

```solidity
// ❌ Плохо: Каждый раз читаем из другого контракта
function expensiveOperation() external {
    require(humanityOracle.isVerified(msg.sender), "Not verified");
    // ... 300k gas
}

// ✅ Хорошо: Кэшируем результат, если в одной транзакции много проверок
contract Optimized {
    mapping(address => uint256) public verificationCache;
    
    modifier cached() {
        if (verificationCache[msg.sender] == 0 || 
            verificationCache[msg.sender] < block.timestamp - 1 days) {
            verificationCache[msg.sender] = humanityOracle.isVerified(msg.sender) 
                ? block.timestamp 
                : 0;
        }
        require(verificationCache[msg.sender] > 0, "Not verified");
        _;
    }
}
```

---

## Summary: Integration Paths

| Integration Type | Complexity | Use Case | Setup Time |
|-----------------|------------|----------|------------|
| Smart Contract | Medium | DeFi, NFTs, On-chain games | 30 min |
| JavaScript SDK | Low | Web2/Web3 hybrid sites | 5 min |
| REST API | Low | Backend-only verification | 10 min |
| Browser Extension | Low (for user) | Universal protection | 1 min install |

---

## Next Steps

1. **Получи API Key**: Зарегистрируйся на `dashboard.humanityoracle.io`
2. **Тестируй в Sandbox**: Base Sepolia testnet доступен для разработки
3. **Интегрируй SDK**: `npm install @humanityoracle/sdk`
4. **Деплой в Production**: Переключись на Base mainnet когда готов

---

**Questions?**  
Telegram: [@humanity_oracle_dev](https://t.me/humanity_oracle_dev)  
Docs: `docs.humanityoracle.io`  
GitHub: `github.com/humanity-oracle/integration-examples`

---

*Remember: "One verification, infinite possibilities. Be human, be trusted."* 🤖→👤

