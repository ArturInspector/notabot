import { ethers } from 'ethers';
const wallet = ethers.Wallet.createRandom();

console.log('\n🔑 Backend Oracle Wallet Generated:\n');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('\n⚠️  ВАЖНО:');
console.log('1. Скопируй Private Key в packages/backend/.env → BACKEND_PRIVATE_KEY');
console.log('2. Используй Address при deploy GitcoinAdapter.sol');
console.log('3. НЕ храни реальные средства на этом wallet!\n');
