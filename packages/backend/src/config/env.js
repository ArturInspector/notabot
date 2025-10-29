import dotenv from 'dotenv';

dotenv.config();
const REQUIRED_VARS = [
  'BACKEND_PRIVATE_KEY',
  'GITCOIN_API_KEY', 
  'GITCOIN_SCORER_ID'
];


REQUIRED_VARS.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ CRITICAL: ${varName} not set in .env`);
    console.error(`💡 See .env.example for setup instructions`);
    process.exit(1);
  }
});

export const config = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'],
  
  BACKEND_PRIVATE_KEY: process.env.BACKEND_PRIVATE_KEY,
  
  SOLANA_RPC_URL: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  SOLANA_ORACLE_PRIVATE_KEY: process.env.SOLANA_ORACLE_PRIVATE_KEY,
  
  GITCOIN_API_KEY: process.env.GITCOIN_API_KEY,
  GITCOIN_SCORER_ID: process.env.GITCOIN_SCORER_ID,
  GITCOIN_MIN_SCORE: parseInt(process.env.GITCOIN_MIN_SCORE || '20', 10),
  DEMO_MODE: process.env.DEMO_MODE === 'true',
  RATE_LIMIT_WINDOW_MS: 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: 100,
  REQUEST_TIMEOUT_MS: 30000,
  MAX_PAYLOAD_SIZE: '10kb',
  
  PROOF_VALIDITY_SECONDS: 3600
};

if (!/^(0x)?[0-9a-fA-F]{64}$/.test(config.BACKEND_PRIVATE_KEY)) {
  console.error('❌ BACKEND_PRIVATE_KEY must be 64 hex characters');
  process.exit(1);
}

console.log(' env config loaded');
console.log(`   mode: ${config.NODE_ENV}`);
console.log(`  port: ${config.PORT}`);

