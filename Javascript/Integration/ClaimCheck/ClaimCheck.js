/**
 * ClaimCheck Pattern
 *
 * Reduces message size by storing large data externally and passing only
 * a claim check (reference token) in the message. The receiver uses the
 * claim check to retrieve the actual data when needed.
 */

const EventEmitter = require('events');
const crypto = require('crypto');

class ClaimCheck extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      maxInlineSize: config.maxInlineSize || 1024, // 1KB default
      storageExpiry: config.storageExpiry || 3600000, // 1 hour default
      enableCompression: config.enableCompression || false,
      enableEncryption: config.enableEncryption || false,
      ...config
    };

    this.storage = new Map();
    this.expirations = new Map();
    this.encryptionKey = config.encryptionKey || null;
    this.statistics = {
      checksCreated: 0,
      checksRedeemed: 0,
      checksExpired: 0,
      bytesStored: 0,
      bytesSaved: 0
    };

    if (config.cleanupInterval) {
      this.startCleanup(config.cleanupInterval);
    }
  }

  /**
   * Store data and create claim check
   */
  createClaimCheck(data, options = {}) {
    try {
      this.statistics.checksCreated++;

      const dataSize = this.estimateSize(data);
      const claimId = this.generateClaimId();

      // Determine if data should be stored externally
      const shouldStore = options.forceStore || dataSize > this.config.maxInlineSize;

      if (!shouldStore) {
        return {
          inline: true,
          data,
          metadata: {
            size: dataSize,
            timestamp: Date.now()
          }
        };
      }

      // Prepare data for storage
      let storedData = data;

      if (this.config.enableCompression || options.compress) {
        storedData = this.compress(storedData);
      }

      if (this.config.enableEncryption || options.encrypt) {
        storedData = this.encrypt(storedData);
      }

      const expiresAt = Date.now() + (options.ttl || this.config.storageExpiry);

      // Store data
      const storedItem = {
        data: storedData,
        originalSize: dataSize,
        compressed: this.config.enableCompression || options.compress || false,
        encrypted: this.config.enableEncryption || options.encrypt || false,
        createdAt: Date.now(),
        expiresAt,
        metadata: options.metadata || {}
      };

      this.storage.set(claimId, storedItem);
      this.statistics.bytesStored += dataSize;
      this.statistics.bytesSaved += dataSize;

      // Set expiration timer
      this.setExpiration(claimId, expiresAt);

      const claimCheck = {
        inline: false,
        claimId,
        metadata: {
          size: dataSize,
          timestamp: Date.now(),
          expiresAt,
          compressed: storedItem.compressed,
          encrypted: storedItem.encrypted
        }
      };

      this.emit('claimCheckCreated', {
        claimId,
        size: dataSize
      });

      return claimCheck;
    } catch (error) {
      this.emit('createError', { error: error.message });
      throw error;
    }
  }

  /**
   * Redeem claim check to get original data
   */
  redeemClaimCheck(claimCheck, options = {}) {
    try {
      // Handle inline data
      if (claimCheck.inline) {
        return claimCheck.data;
      }

      const claimId = claimCheck.claimId;
      const storedItem = this.storage.get(claimId);

      if (!storedItem) {
        throw new Error(`Claim check ${claimId} not found or expired`);
      }

      // Check expiration
      if (Date.now() >= storedItem.expiresAt) {
        this.expireClaim(claimId);
        throw new Error(`Claim check ${claimId} has expired`);
      }

      let data = storedItem.data;

      // Decrypt if needed
      if (storedItem.encrypted) {
        data = this.decrypt(data);
      }

      // Decompress if needed
      if (storedItem.compressed) {
        data = this.decompress(data);
      }

      this.statistics.checksRedeemed++;

      // Remove claim if specified
      if (options.removeAfterRedeem) {
        this.removeClaim(claimId);
      }

      this.emit('claimCheckRedeemed', {
        claimId,
        size: storedItem.originalSize
      });

      return data;
    } catch (error) {
      this.emit('redeemError', {
        claimId: claimCheck.claimId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Check if claim exists and is valid
   */
  isClaimValid(claimId) {
    const storedItem = this.storage.get(claimId);
    if (!storedItem) return false;
    return Date.now() < storedItem.expiresAt;
  }

  /**
   * Extend claim expiration
   */
  extendClaimExpiration(claimId, additionalTime) {
    const storedItem = this.storage.get(claimId);

    if (!storedItem) {
      throw new Error(`Claim check ${claimId} not found`);
    }

    // Clear existing expiration
    if (this.expirations.has(claimId)) {
      clearTimeout(this.expirations.get(claimId));
    }

    // Update expiration
    storedItem.expiresAt += additionalTime;
    this.setExpiration(claimId, storedItem.expiresAt);

    this.emit('expirationExtended', {
      claimId,
      newExpiresAt: storedItem.expiresAt
    });

    return storedItem.expiresAt;
  }

  /**
   * Remove claim manually
   */
  removeClaim(claimId) {
    const storedItem = this.storage.get(claimId);

    if (!storedItem) {
      return false;
    }

    // Clear expiration timer
    if (this.expirations.has(claimId)) {
      clearTimeout(this.expirations.get(claimId));
      this.expirations.delete(claimId);
    }

    this.storage.delete(claimId);

    this.emit('claimRemoved', { claimId });
    return true;
  }

  /**
   * Set expiration timer for claim
   */
  setExpiration(claimId, expiresAt) {
    const timeUntilExpiration = expiresAt - Date.now();

    if (timeUntilExpiration > 0) {
      const timer = setTimeout(() => {
        this.expireClaim(claimId);
      }, timeUntilExpiration);

      this.expirations.set(claimId, timer);
    }
  }

  /**
   * Expire a claim
   */
  expireClaim(claimId) {
    const storedItem = this.storage.get(claimId);

    if (storedItem) {
      this.statistics.checksExpired++;
      this.storage.delete(claimId);
      this.expirations.delete(claimId);

      this.emit('claimExpired', {
        claimId,
        age: Date.now() - storedItem.createdAt
      });
    }
  }

  /**
   * Get claim metadata without retrieving data
   */
  getClaimMetadata(claimId) {
    const storedItem = this.storage.get(claimId);

    if (!storedItem) {
      return null;
    }

    return {
      claimId,
      size: storedItem.originalSize,
      createdAt: storedItem.createdAt,
      expiresAt: storedItem.expiresAt,
      compressed: storedItem.compressed,
      encrypted: storedItem.encrypted,
      remainingTTL: storedItem.expiresAt - Date.now(),
      metadata: storedItem.metadata
    };
  }

  /**
   * Batch create claim checks
   */
  createBatch(dataItems, options = {}) {
    const claimChecks = [];
    const errors = [];

    dataItems.forEach((data, index) => {
      try {
        const claimCheck = this.createClaimCheck(data, options);
        claimChecks.push(claimCheck);
      } catch (error) {
        errors.push({ index, error: error.message });
      }
    });

    this.emit('batchCreated', {
      total: dataItems.length,
      success: claimChecks.length,
      failed: errors.length
    });

    return { claimChecks, errors };
  }

  /**
   * Batch redeem claim checks
   */
  redeemBatch(claimChecks, options = {}) {
    const dataItems = [];
    const errors = [];

    claimChecks.forEach((claimCheck, index) => {
      try {
        const data = this.redeemClaimCheck(claimCheck, options);
        dataItems.push(data);
      } catch (error) {
        errors.push({ index, claimId: claimCheck.claimId, error: error.message });
      }
    });

    this.emit('batchRedeemed', {
      total: claimChecks.length,
      success: dataItems.length,
      failed: errors.length
    });

    return { dataItems, errors };
  }

  /**
   * Compress data
   */
  compress(data) {
    const jsonString = JSON.stringify(data);
    return {
      compressed: Buffer.from(jsonString).toString('base64'),
      originalSize: jsonString.length
    };
  }

  /**
   * Decompress data
   */
  decompress(compressedData) {
    const jsonString = Buffer.from(compressedData.compressed, 'base64').toString('utf8');
    return JSON.parse(jsonString);
  }

  /**
   * Encrypt data
   */
  encrypt(data) {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not configured');
    }

    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    const jsonString = JSON.stringify(data);
    let encrypted = cipher.update(jsonString, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted,
      iv: iv.toString('hex'),
      algorithm
    };
  }

  /**
   * Decrypt data
   */
  decrypt(encryptedData) {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not configured');
    }

    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const decipher = crypto.createDecipheriv(encryptedData.algorithm, key, iv);

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }

  /**
   * Start cleanup process
   */
  startCleanup(interval) {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpired();
    }, interval);
  }

  /**
   * Clean up expired claims
   */
  cleanupExpired() {
    const now = Date.now();
    const expiredIds = [];

    for (const [claimId, storedItem] of this.storage) {
      if (now >= storedItem.expiresAt) {
        expiredIds.push(claimId);
      }
    }

    expiredIds.forEach(id => this.expireClaim(id));

    if (expiredIds.length > 0) {
      this.emit('cleanupCompleted', {
        expiredCount: expiredIds.length,
        remainingCount: this.storage.size
      });
    }

    return expiredIds.length;
  }

  /**
   * Stop cleanup process
   */
  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Estimate data size
   */
  estimateSize(data) {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }

  /**
   * Generate unique claim ID
   */
  generateClaimId() {
    return `claim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all active claims
   */
  getActiveClaims() {
    const claims = [];
    const now = Date.now();

    for (const [claimId, storedItem] of this.storage) {
      if (now < storedItem.expiresAt) {
        claims.push({
          claimId,
          size: storedItem.originalSize,
          createdAt: storedItem.createdAt,
          expiresAt: storedItem.expiresAt,
          remainingTTL: storedItem.expiresAt - now
        });
      }
    }

    return claims;
  }

  /**
   * Clear all claims
   */
  clear() {
    const count = this.storage.size;

    this.expirations.forEach(timer => clearTimeout(timer));
    this.expirations.clear();
    this.storage.clear();

    this.emit('cleared', { count });
    return count;
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      ...this.statistics,
      activeClaims: this.storage.size,
      averageSize: this.statistics.checksCreated > 0
        ? Math.round(this.statistics.bytesStored / this.statistics.checksCreated)
        : 0,
      redemptionRate: this.statistics.checksCreated > 0
        ? ((this.statistics.checksRedeemed / this.statistics.checksCreated) * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }

  /**
   * Reset statistics
   */
  resetStatistics() {
    this.statistics = {
      checksCreated: 0,
      checksRedeemed: 0,
      checksExpired: 0,
      bytesStored: 0,
      bytesSaved: 0
    };
  }

  /**
   * Execute pattern demonstration
   */
  execute() {
    console.log('ClaimCheck Pattern - Managing large message data');

    // Create claim check for large data
    const largeData = { items: new Array(1000).fill({ id: 1, name: 'Item', data: 'x'.repeat(100) }) };
    const claimCheck = this.createClaimCheck(largeData);

    console.log('Claim check created:', claimCheck.claimId);
    console.log('Data size:', claimCheck.metadata.size);

    // Redeem claim check
    const retrievedData = this.redeemClaimCheck(claimCheck);
    console.log('Data retrieved, items:', retrievedData.items.length);

    console.log('Statistics:', this.getStatistics());

    return {
      success: true,
      pattern: 'ClaimCheck',
      statistics: this.getStatistics()
    };
  }
}

module.exports = ClaimCheck;
