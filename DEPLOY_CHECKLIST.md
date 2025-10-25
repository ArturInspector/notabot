# 🚀 BASE SEPOLIA DEPLOY CHECKLIST

## Подготовка (5 минут):

### 1️⃣ Создай Backend Oracle Wallet
```bash
cd packages/backend
npm run generate-wallet
```
**Сохрани:**
- ✅ Address (для BACKEND_ORACLE_ADDRESS)
- ✅ Private Key (для backend .env)

---

### 2️⃣ Создай Deployer Wallet
```bash
cd packages/hardhat
yarn generate
```
**Или импортируй существующий:**
```bash
yarn account:import
# Введи свой приватный ключ
```

**Получи testnet ETH:**
- 🔗 https://www.alchemy.com/faucets/base-sepolia
- Нужно: ~0.1 ETH (хватит на всё)

---

### 3️⃣ Получи Alchemy API Key
1. Иди на https://dashboard.alchemy.com
2. Signup бесплатно
3. Create App → Base Sepolia
4. Copy API Key

---

### 4️⃣ Получи Gitcoin API Keys
1. https://scorer.gitcoin.co/
2. Sign in с кошельком
3. Create Scorer
4. Copy API Key + Scorer ID

---

## Настройка ENV:

### Backend (.env):
```bash
cd packages/backend
cp .env.example .env
nano .env
```
Заполни:
```env
BACKEND_PRIVATE_KEY=0x...  # Из шага 1
GITCOIN_API_KEY=...        # Из шага 4
GITCOIN_SCORER_ID=...      # Из шага 4
```

### Hardhat (.env):
```bash
cd packages/hardhat
cp .env.example .env
nano .env
```
Заполни:
```env
ALCHEMY_API_KEY=...                    # Из шага 3
__RUNTIME_DEPLOYER_PRIVATE_KEY=0x...  # Из шага 2
BACKEND_ORACLE_ADDRESS=0x...          # Address из шага 1
```

---

## 🚀 DEPLOY:

```bash
cd packages/hardhat

# Проверь баланс деплоера:
yarn account

# Deploy на Base Sepolia:
yarn deploy --network baseSepolia
```

**Ожидаемый вывод:**
```
Deploying VerificationToken...
✅ Deployed at: 0x...

Deploying VerificationSBT...
✅ Deployed at: 0x...

Deploying MainAggregator...
✅ Deployed at: 0x...

Deploying WorldcoinAdapter...
✅ Deployed at: 0x...

Deploying GitcoinAdapter...
✅ Deployed at: 0x...
📝 Backend Oracle Address: 0x...
```

---

## ✅ После деплоя:

**Сохрани адреса контрактов:**
- MainAggregator: `0x...` ← ГЛАВНЫЙ (для интеграций)
- GitcoinAdapter: `0x...`
- WorldcoinAdapter: `0x...`

**Проверь на Base Sepolia Explorer:**
- https://sepolia.basescan.org/address/YOUR_ADDRESS

**Verify контракты (опционально):**
```bash
yarn hardhat --network baseSepolia etherscan-verify
```

---

## 🌐 Deploy Backend:

```bash
cd packages/backend

# Railway:
railway login
railway init
railway up

# Добавь ENV в Railway dashboard:
railway open
# Settings → Variables → добавь все из .env
```

**Проверь:**
```bash
curl https://your-backend.railway.app/health
```

---

## 🎉 ГОТОВО!

**Теперь можно:**
- ✅ Интегрировать в другие контракты
- ✅ Тестировать верификацию через фронтенд
- ✅ Показать на хакатоне

**Next steps:**
- [ ] Deploy фронтенда на Vercel
- [ ] Создать demo видео
- [ ] Написать документацию для интеграций

