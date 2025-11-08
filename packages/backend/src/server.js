import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from './config/env.js';
import { gitcoinService } from './services/gitcoin.js';
import { pohService } from './services/poh.js';
import { brightidService } from './services/brightid.js';
import { signerService } from './services/signer.js';
import { solanaService } from './services/solana.js';
import { validateAddress, sanitizeError } from './middleware/validators.js';
import { logger } from './utils/logger.js';

const app = express();


app.set('trust proxy', 1);

// CORS configuration with Vercel support
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check exact matches from ALLOWED_ORIGINS
    if (config.ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    // Allow all Vercel preview deployments (*.vercel.app)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

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

    if (config.DEMO_MODE) {
      logger.warn('DEMO MODE: Skipping real Gitcoin API', { userAddress });
      const score = 99;
      const rawScore = '99.0';
      const userId = signerService.createUserId('gitcoin', userAddress, rawScore);
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = await signerService.signGitcoinProof(
        userAddress,
        userId,
        score,
        timestamp
      );

      return res.json({
        success: true,
        demo: true,
        data: {
          userId,
          score,
          timestamp,
          signature,
          expiresAt: timestamp + config.PROOF_VALIDITY_SECONDS,
          backendAddress: signerService.getAddress()
        }
      });
    }

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


app.post('/api/poh/verify', validateAddress, async (req, res) => {
  const { userAddress } = req.body;
  
  try {
    logger.info('PoH verification request', { userAddress });

    const { registered, pohId } = await pohService.isRegistered(userAddress);
    
    if (!registered) {
      logger.warn('Not registered in PoH', { userAddress });
      return res.status(400).json({ 
        error: 'Not registered in Proof of Humanity',
        code: 'NOT_REGISTERED_IN_POH'
      });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await signerService.signPoHProof(
      userAddress,
      pohId,
      timestamp
    );

    logger.info('PoH verification success', { 
      userAddress, 
      pohId: pohId.slice(0, 10) + '...' 
    });

    res.json({
      success: true,
      data: {
        pohId,
        timestamp,
        signature,
        expiresAt: timestamp + config.PROOF_VALIDITY_SECONDS,
        backendAddress: signerService.getAddress()
      }
    });

  } catch (error) {
    logger.error('PoH verification failed', { 
      userAddress, 
      error: error.message 
    });

    const sanitized = sanitizeError(error);
    const statusCode = error.message.includes('NOT_REGISTERED') ? 404 : 500;
    
    res.status(statusCode).json(sanitized);
  }
});

app.post('/api/brightid/verify', validateAddress, async (req, res) => {
  const { userAddress } = req.body;
  
  try {
    logger.info('BrightID verification request', { userAddress });

    const { unique, contextId } = await brightidService.isVerified(userAddress);
    
    if (!unique) {
      logger.warn('Not verified in BrightID', { userAddress });
      return res.status(400).json({ 
        error: 'Not verified in BrightID',
        code: 'NOT_VERIFIED_IN_BRIGHTID'
      });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await signerService.signBrightIDProof(
      userAddress,
      contextId,
      timestamp
    );

    logger.info('BrightID verification success', { 
      userAddress, 
      contextId: contextId.slice(0, 10) + '...' 
    });

    res.json({
      success: true,
      data: {
        contextId,
        timestamp,
        signature,
        expiresAt: timestamp + config.PROOF_VALIDITY_SECONDS,
        backendAddress: signerService.getAddress()
      }
    });

  } catch (error) {
    logger.error('BrightID verification failed', { 
      userAddress, 
      error: error.message 
    });

    const sanitized = sanitizeError(error);
    const statusCode = error.message.includes('NOT_VERIFIED') ? 404 : 500;
    
    res.status(statusCode).json(sanitized);
  }
});

app.post('/api/demo/verify', validateAddress, async (req, res) => {
  const { userAddress, source = 'gitcoin' } = req.body;
  
  logger.info('demo verification request', { userAddress, source });

  if (!config.DEMO_MODE) {
    return res.status(403).json({
      error: 'Demo mode disabled',
      code: 'DEMO_MODE_DISABLED',
      hint: 'Set DEMO_MODE=true in .env for hackathon testing'
    });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  let proof, signature;

  if (source === 'gitcoin') {
    const userId = signerService.createUserId('demo-gitcoin', userAddress, 'hackathon');
    const score = 99;
    signature = await signerService.signGitcoinProof(userAddress, userId, score, timestamp);
    
    proof = {
      userId,
      score,
      timestamp,
      signature,
      expiresAt: timestamp + config.PROOF_VALIDITY_SECONDS,
      backendAddress: signerService.getAddress()
    };
  } else if (source === 'poh') {
    const pohId = signerService.createUserId('demo-poh', userAddress, 'hackathon');
    signature = await signerService.signPoHProof(userAddress, pohId, timestamp);
    
    proof = {
      pohId,
      timestamp,
      signature,
      expiresAt: timestamp + config.PROOF_VALIDITY_SECONDS,
      backendAddress: signerService.getAddress()
    };
  } else if (source === 'brightid') {
    const contextId = signerService.createUserId('demo-brightid', userAddress, 'hackathon');
    signature = await signerService.signBrightIDProof(userAddress, contextId, timestamp);
    
    proof = {
      contextId,
      timestamp,
      signature,
      expiresAt: timestamp + config.PROOF_VALIDITY_SECONDS,
      backendAddress: signerService.getAddress()
    };
  } else {
    return res.status(400).json({
      error: 'Invalid source',
      code: 'INVALID_SOURCE',
      validSources: ['gitcoin', 'poh', 'brightid']
    });
  }

  logger.info('🎪 DEMO verification success', { userAddress, source });

  res.json({
    success: true,
    demo: true,
    data: proof
  });
});

app.post('/api/solana/verify', async (req, res) => {
  const { userPublicKey, source, uniqueId } = req.body;
  
  try {
    if (!userPublicKey || !source || !uniqueId) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'INVALID_REQUEST',
        required: ['userPublicKey', 'source', 'uniqueId']
      });
    }

    logger.info('Solana verification request', { userPublicKey, source });

    const existingData = await solanaService.getVerificationData(userPublicKey);
    if (existingData && existingData.isVerified) {
      logger.info('User already verified on Solana', { userPublicKey });
      return res.json({
        success: true,
        alreadyVerified: true,
        data: existingData
      });
    }

    const result = await solanaService.verifyUser(userPublicKey, source, uniqueId);

    logger.info('Solana verification success', { 
      userPublicKey, 
      signature: result.signature 
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logger.error('Solana verification failed', { 
      userPublicKey: req.body.userPublicKey, 
      error: error.message 
    });

    const sanitized = sanitizeError(error);
    res.status(500).json(sanitized);
  }
});

app.get('/api/solana/check/:userPublicKey', async (req, res) => {
  const { userPublicKey } = req.params;
  
  try {
    logger.info('Solana check verification', { userPublicKey });

    const data = await solanaService.getVerificationData(userPublicKey);
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Verification not found',
        code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data
    });

  } catch (error) {
    logger.error('Solana check failed', { 
      userPublicKey, 
      error: error.message 
    });

    const sanitized = sanitizeError(error);
    res.status(500).json(sanitized);
  }
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
  logger.info(`EVM Oracle Address: ${signerService.getAddress()}`);
  logger.info(`Solana Oracle Address: ${solanaService.getOraclePublicKey()}`);
  logger.info('Endpoints:');
  console.log('  GET  /health');
  console.log('  POST /api/gitcoin/verify');
  console.log('  POST /api/poh/verify');
  console.log('  POST /api/brightid/verify');
  console.log('  POST /api/solana/verify');
  console.log('  GET  /api/solana/check/:userPublicKey');
  if (config.DEMO_MODE) {
    console.log('  POST /api/demo/verify (DEMO MODE ENABLED)');
  }
  console.log('  POST /api/binance/verify (stub)');
});

export default app;
