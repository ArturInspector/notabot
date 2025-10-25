import axios from 'axios';
import { logger } from '../utils/logger.js';

const POH_GRAPH_URL = 'https://api.thegraph.com/subgraphs/name/kleros/proof-of-humanity-mainnet';
class PoHService {
  async isRegistered(address) {
    try {
      const query = `
        query($id: ID!) {
          submission(id: $id) {
            id
            registered
            submissionTime
          }
        }
      `;
      
      const { data } = await axios.post(POH_GRAPH_URL, {
        query,
        variables: { id: address.toLowerCase() }
      });

      const submission = data?.data?.submission;
      
      if (!submission || !submission.registered) {
        throw new Error('NOT_REGISTERED_IN_POH');
      }

      return {
        registered: true,
        submissionTime: submission.submissionTime,
        pohId: submission.id
      };
    } catch (error) {
      logger.error('PoH API error', { address, error: error.message });
      throw error;
    }
  }
}

export const pohService = new PoHService();

