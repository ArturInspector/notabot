/**
 * Gitcoin integration service
 */

import axios from 'axios';
import { config } from '../config/env.js';

const GITCOIN_API_BASE = 'https://api.scorer.gitcoin.co';

class GitcoinService {
  async getPassportScore(userAddress) {
    try {
      const response = await axios.get(
        `${GITCOIN_API_BASE}/registry/score/${config.GITCOIN_SCORER_ID}/${userAddress}`,
        {
          headers: {
            'X-API-KEY': config.GITCOIN_API_KEY,
            'Accept': 'application/json'
          },
          timeout: config.REQUEST_TIMEOUT_MS
        }
      );

      const { score, evidence, status } = response.data;
      
      return {
        score: parseFloat(score) || 0,
        rawScore: evidence?.rawScore || score,
        status: status || 'DONE'
      };

    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('NO_PASSPORT_FOUND');
      }
      
      if (error.response?.status === 401) {
        throw new Error('INVALID_API_KEY');
      }

      if (error.code === 'ECONNABORTED') {
        throw new Error('GITCOIN_API_TIMEOUT');
      }

      throw new Error(`GITCOIN_API_ERROR: ${error.message}`);
    }
  }

  isScoreValid(score) {
    return score >= config.GITCOIN_MIN_SCORE;
  }
}

export const gitcoinService = new GitcoinService();

