// request validation middleware
import { ethers } from 'ethers';
export function validateAddress(req, res, next) {
  const { userAddress } = req.body;

  if (!userAddress) {
    return res.status(400).json({ 
      error: 'Missing userAddress',
      code: 'INVALID_INPUT'
    });
  }

  if (!ethers.isAddress(userAddress)) {
    return res.status(400).json({ 
      error: 'Invalid Ethereum address',
      code: 'INVALID_ADDRESS',
      address: userAddress
    });
  }

  //checksum format
  req.body.userAddress = ethers.getAddress(userAddress);
  next();
}

export function sanitizeError(error) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const ERROR_MESSAGES = {
    'NO_PASSPORT_FOUND': 'No Gitcoin Passport found for this address',
    'INVALID_API_KEY': 'Backend API configuration error',
    'GITCOIN_API_TIMEOUT': 'Gitcoin API timeout, please try again',
    'SCORE_TOO_LOW': 'Passport score below minimum threshold'
  };
  const errorCode = error.message.split(':')[0];
  const safeMessage = ERROR_MESSAGES[errorCode] || 'Internal server error';
  return {
    error: safeMessage,
    code: errorCode,
    ...(isDevelopment && { details: error.message })
  };
}

