import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TEST_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'; // Vitalik для теста

console.log('🧪 Testing Gitcoin Passport API...\n');

if (!process.env.GITCOIN_API_KEY || !process.env.GITCOIN_SCORER_ID) {
  console.error('❌ GITCOIN_API_KEY or GITCOIN_SCORER_ID not set in .env');
  process.exit(1);
}

try {
  const response = await axios.get(
    `https://api.scorer.gitcoin.co/registry/score/${process.env.GITCOIN_SCORER_ID}/${TEST_ADDRESS}`,
    {
      headers: {
        'X-API-KEY': process.env.GITCOIN_API_KEY,
        'Accept': 'application/json'
      }
    }
  );

  console.log('✅ API Connection Success!\n');
  console.log('Test Address:', TEST_ADDRESS);
  console.log('Score:', response.data.score);
  console.log('Status:', response.data.status);
  console.log('\n🎉 Backend готов к работе!');
  
} catch (error) {
  console.error('❌ API Error:', error.response?.data || error.message);
  console.log('\n💡 Получи API key:');
  console.log('1. https://scorer.gitcoin.co/');
  console.log('2. Sign in с wallet');
  console.log('3. Create Scorer → Copy API Key & Scorer ID');
}

