import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Backend wallet (для подписи данных)
const BACKEND_PRIVATE_KEY = process.env.BACKEND_PRIVATE_KEY;
const GITCOIN_API_KEY = process.env.GITCOIN_API_KEY;
const GITCOIN_SCORER_ID = process.env.GITCOIN_SCORER_ID;

if (!BACKEND_PRIVATE_KEY) {
  throw new Error('BACKEND_PRIVATE_KEY not set in .env');
}

const backendWallet = new ethers.Wallet(BACKEND_PRIVATE_KEY);
console.log('Backend Oracle Address:', backendWallet.address);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'NotABot Backend',
    oracleAddress: backendWallet.address
  });
});

/**
 * POST /api/gitcoin/verify
 * Получает Gitcoin Passport score и подписывает данные для on-chain верификации
 * Body: { userAddress: "0x..." }
 * Returns: { userId, score, timestamp, signature }
 */
app.post('/api/gitcoin/verify', async (req, res) => {
  try {
    const { userAddress } = req.body;

    if (!userAddress || !ethers.isAddress(userAddress)) {
      return res.status(400).json({ error: 'Invalid address' });
    }

    // 1. Получаем score из Gitcoin Passport API
    const gitcoinResponse = await axios.get(
      `https://api.scorer.gitcoin.co/registry/score/${GITCOIN_SCORER_ID}/${userAddress}`,
      {
        headers: {
          'X-API-KEY': GITCOIN_API_KEY,
          'Accept': 'application/json'
        }
      }
    );

    const { score, evidence } = gitcoinResponse.data;
    
    if (!score || parseFloat(score) < 20) {
      return res.status(400).json({ 
        error: 'Score too low',
        score: parseFloat(score),
        minRequired: 20
      });
    }

    // 2. Создаём уникальный userId (hash от address для privacy)
    const userId = ethers.keccak256(
      ethers.toUtf8Bytes(`gitcoin:${userAddress}:${evidence?.rawScore || score}`)
    );

    // 3. Текущий timestamp (для proof validity)
    const timestamp = Math.floor(Date.now() / 1000);

    // 4. Создаём message для подписи (такой же как в GitcoinAdapter.sol line 41)
    const message = ethers.solidityPackedKeccak256(
      ['address', 'bytes32', 'uint256', 'uint256'],
      [userAddress, userId, Math.floor(parseFloat(score)), timestamp]
    );

    // 5. Подписываем через backend wallet
    const signature = await backendWallet.signMessage(ethers.getBytes(message));

    // 6. Возвращаем данные для фронтенда
    res.json({
      success: true,
      data: {
        userId,
        score: Math.floor(parseFloat(score)),
        timestamp,
        signature,
        // Для debug:
        backendAddress: backendWallet.address,
        expiresAt: timestamp + 3600 // 1 hour validity
      }
    });

  } catch (error) {
    console.error('Gitcoin verification error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({ 
        error: 'No Gitcoin Passport found for this address',
        hint: 'User needs to create passport at passport.gitcoin.co'
      });
    }

    res.status(500).json({ 
      error: 'Failed to verify Gitcoin Passport',
      details: error.message 
    });
  }
});

/**
 * POST /api/worldcoin/prepare
 * 
 * (OPTIONAL) Для будущего: если нужна pre-verification
 * Worldcoin работает on-chain, но можем добавить rate limiting здесь
 */
app.post('/api/worldcoin/prepare', async (req, res) => {
  try {
    const { userAddress } = req.body;

    // TODO: можем добавить rate limiting, analytics, etc.
    
    res.json({
      success: true,
      message: 'Worldcoin verification is fully on-chain, no backend needed'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NotABot Backend running on port ${PORT}`);
  console.log(`📡 Oracle Address: ${backendWallet.address}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  /health`);
  console.log(`  POST /api/gitcoin/verify`);
});

export default app;

