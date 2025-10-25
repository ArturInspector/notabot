import axios from 'axios';
import { logger } from '../utils/logger.js';

const BRIGHTID_NODE_URL = 'https://app.brightid.org/node/v6';
const BRIGHTID_CONTEXT = 'NotABot'; // Your app context

class BrightIDService {
  async isVerified(address) {
    try {
      const contextId = address.toLowerCase();
      const { data } = await axios.get(
        `${BRIGHTID_NODE_URL}/verifications/${BRIGHTID_CONTEXT}/${contextId}`
      );

      if (!data?.data?.unique) {
        throw new Error('NOT_VERIFIED_IN_BRIGHTID');
      }

      return {
        unique: data.data.unique,
        contextId: data.data.contextIds?.[0] || contextId,
        timestamp: Date.now()
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('NOT_VERIFIED_IN_BRIGHTID');
      }
      logger.error('BrightID API error', { address, error: error.message });
      throw error;
    }
  }
}

export const brightidService = new BrightIDService();

