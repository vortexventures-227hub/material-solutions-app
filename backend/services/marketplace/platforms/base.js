/**
 * Base Platform Class
 * Abstract base for all marketplace integrations
 */

class PlatformError extends Error {
  constructor(message, platform, code = 'PLATFORM_ERROR') {
    super(message);
    this.name = 'PlatformError';
    this.platform = platform;
    this.code = code;
  }
}

class RateLimitError extends PlatformError {
  constructor(message, platform, retryAfter = 60) {
    super(message, platform, 'RATE_LIMIT');
    this.retryAfter = retryAfter;
  }
}

class AuthenticationError extends PlatformError {
  constructor(message, platform) {
    super(message, platform, 'AUTH_ERROR');
  }
}

class ValidationError extends PlatformError {
  constructor(message, platform) {
    super(message, platform, 'VALIDATION_ERROR');
  }
}

class BasePlatform {
  constructor(config = {}) {
    this.config = config;
    this.platformName = 'base';
    this.rateLimit = 100; // requests per minute
    this.retryAttempts = 3;
    this.retryDelay = 1000; // ms
  }

  /**
   * Check if platform is configured and active
   */
  async isAvailable() {
    return this.config.is_active && this.hasCredentials();
  }

  /**
   * Check if credentials are present
   */
  hasCredentials() {
    return !!(this.config.api_key || this.config.access_token);
  }

  /**
   * Post inventory to this platform
   * @param {Object} inventory - The inventory item
   * @param {Object} content - AI-generated platform-specific content
   * @returns {Object} { success, url, externalId, error }
   */
  async post(inventory, content) {
    throw new Error('post() must be implemented by subclass');
  }

  /**
   * Update an existing listing
   */
  async update(externalId, inventory, content) {
    throw new Error('update() must be implemented by subclass');
  }

  /**
   * Delete a listing
   */
  async delete(externalId) {
    throw new Error('delete() must be implemented by subclass');
  }

  /**
   * Get listing status
   */
  async getStatus(externalId) {
    throw new Error('getStatus() must be implemented by subclass');
  }

  /**
   * Refresh authentication if needed
   */
  async refreshAuth() {
    return false;
  }

  /**
   * Execute with retry logic
   */
  async withRetry(operation, context = '') {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error instanceof AuthenticationError ||
            error instanceof ValidationError) {
          throw error;
        }
        
        // Rate limit errors have their own backoff
        if (error instanceof RateLimitError) {
          await this.sleep(error.retryAfter * 1000);
          continue;
        }
        
        // Exponential backoff for other errors
        if (attempt < this.retryAttempts) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Rate limiter check
   */
  async checkRateLimit() {
    if (this.config.rate_limit_remaining <= 0) {
      throw new RateLimitError(
        'Rate limit exceeded',
        this.platformName,
        60 // retry after 60 seconds
      );
    }
    // Decrement counter
    this.config.rate_limit_remaining--;
  }

  /**
   * Format inventory for logging
   */
  formatInventoryLog(inventory) {
    return `${inventory.year} ${inventory.make} ${inventory.model} (ID: ${inventory.id})`;
  }

  /**
   * Build result object
   */
  buildResult(success, data = {}) {
    return {
      success,
      platform: this.platformName,
      url: data.url || null,
      externalId: data.externalId || null,
      error: data.error || null,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = {
  BasePlatform,
  PlatformError,
  RateLimitError,
  AuthenticationError,
  ValidationError
};
