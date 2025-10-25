import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { gitcoinService } from './services/gitcoin.js';
import { signerService } from './services/signer.js';
import { validateAddress, sanitizeError } from './middleware/validators.js';
import { logger } from './utils/logger.js';

const app = express();

app.use(cors({
  origin: config.ALLOWED_ORIGINS,
  credentials: true
}));

app.use(express.json({ limit: config.MAX_PAYLOAD_SIZE }));

const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: { error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

logger.info('NotABot Backend starting', {
  oracleAddress: signerService.getAddress(),
  environment: config.NODE_ENV,
  port: config.PORT
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'NotABot Backend',
    version: '1.0.0',
    oracleAddress: signerService.getAddress(),
    timestamp: Math.floor(Date.now() / 1000)
  });
});

app.post('/api/gitcoin/verify', validateAddress, async (req, res) => {
  const { userAddress } = req.body;
  
  try {
    logger.info('Gitcoin verification request', { userAddress });

    const { score, rawScore } = await gitcoinService.getPassportScore(userAddress);
    
    if (!gitcoinService.isScoreValid(score)) {
      logger.warn('Score too low', { userAddress, score, minRequired: config.GITCOIN_MIN_SCORE });
      return res.status(400).json({ 
        error: 'Score below minimum threshold',
        code: 'SCORE_TOO_LOW',
        score,
        minRequired: config.GITCOIN_MIN_SCORE
      });
    }

    const userId = signerService.createUserId('gitcoin', userAddress, rawScore);
    const timestamp = Math.floor(Date.now() / 1000);
    const scoreInt = Math.floor(score);
    const signature = await signerService.signGitcoinProof(
      userAddress,
      userId,
      scoreInt,
      timestamp
    );

    logger.info('Gitcoin verification success', { 
      userAddress, 
      score: scoreInt,
      userId: userId.slice(0, 10) + '...' 
    });

    res.json({
      success: true,
      data: {
        userId,
        score: scoreInt,
        timestamp,
        signature,
        expiresAt: timestamp + config.PROOF_VALIDITY_SECONDS,
        backendAddress: signerService.getAddress()
      }
    });

  } catch (error) {
    logger.error('Gitcoin verification failed', { 
      userAddress, 
      error: error.message 
    });

    const sanitized = sanitizeError(error);
    const statusCode = error.message.includes('NO_PASSPORT_FOUND') ? 404 : 500;
    
    res.status(statusCode).json(sanitized);
  }
});

app.post('/api/worldcoin/prepare', validateAddress, async (req, res) => {
  const { userAddress } = req.body;
  
  logger.info('Worldcoin prepare request', { userAddress });
  
  res.json({
    success: true,
    message: 'Worldcoin verification is fully on-chain',
    info: 'Use WorldcoinAdapter.verifyAndRegister() directly from frontend'
  });
});

app.post('/api/binance/verify', validateAddress, async (req, res) => {
  const { userAddress } = req.body;
  
  logger.info('Binance verify request (stub)', { userAddress });
  
  res.status(503).json({
    success: false,
    error: 'Coming Soon',
    code: 'NOT_IMPLEMENTED',
    message: 'Binance KYC integration is under development',
    estimatedRelease: 'Q2 2025',
    hint: 'Use Gitcoin or Worldcoin verification for now'
  });
});

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
  logger.info(`Oracle Address: ${signerService.getAddress()}`);
  logger.info('Endpoints:');
  console.log('  GET  /health');
  console.log('  POST /api/gitcoin/verify');
  console.log('  POST /api/worldcoin/prepare');
  console.log('  POST /api/binance/verify (stub)');
});

export default app;
