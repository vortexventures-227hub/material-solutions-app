const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const HUNTER_API_KEY = process.env.HUNTER_API_KEY;
const BASE_URL = 'https://api.hunter.io/v2';

/**
 * Hunter.io Service for Email Discovery and Verification
 */
const hunterService = {
  /**
   * Find emails associated with a domain
   * @param {string} domain - Domain name to search (e.g. 'google.com')
   * @returns {Promise<Object>} - Hunter.io Domain Search response
   */
  async findEmails(domain) {
    if (!HUNTER_API_KEY) {
      throw new Error('HUNTER_API_KEY is not defined in environment variables.');
    }

    try {
      const response = await axios.get(`${BASE_URL}/domain-search`, {
        params: {
          domain,
          api_key: HUNTER_API_KEY
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`[Hunter.io] Domain Search Error (${domain}):`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Verify an email address
   * @param {string} email - Email to verify
   * @returns {Promise<Object>} - Hunter.io Email Verifier response
   */
  async verifyEmail(email) {
    if (!HUNTER_API_KEY) {
      throw new Error('HUNTER_API_KEY is not defined in environment variables.');
    }

    try {
      const response = await axios.get(`${BASE_URL}/email-verifier`, {
        params: {
          email,
          api_key: HUNTER_API_KEY
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`[Hunter.io] Email Verifier Error (${email}):`, error.response?.data || error.message);
      throw error;
    }
  }
};

module.exports = hunterService;
