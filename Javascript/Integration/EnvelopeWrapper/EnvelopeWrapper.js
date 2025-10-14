/**
 * EnvelopeWrapper Pattern
 *
 * Wraps application data in an envelope that contains routing information
 * and metadata. Allows systems to add headers, authentication, and other
 * context to messages without modifying the payload.
 */

const EventEmitter = require('events');
const crypto = require('crypto');

class EnvelopeWrapper extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      version: config.version || '1.0',
      encryptPayload: config.encryptPayload || false,
      compressPayload: config.compressPayload || false,
      requireAuth: config.requireAuth || false,
      enableSignatures: config.enableSignatures || false,
      ...config
    };

    this.envelopes = new Map();
    this.encryptionKey = config.encryptionKey || null;
    this.statistics = {
      envelopesCreated: 0,
      envelopesUnwrapped: 0,
      encryptedCount: 0,
      signedCount: 0,
      errors: 0
    };
  }

  /**
   * Wrap payload in an envelope
   */
  wrap(payload, options = {}) {
    try {
      this.statistics.envelopesCreated++;

      const envelope = {
        id: this.generateId(),
        version: this.config.version,
        timestamp: Date.now(),
        headers: this.createHeaders(options.headers),
        metadata: this.createMetadata(payload, options.metadata),
        payload: payload,
        routing: options.routing || {},
        authentication: options.authentication || null,
        signature: null
      };

      // Encrypt payload if required
      if (this.config.encryptPayload || options.encrypt) {
        envelope.payload = this.encryptPayload(envelope.payload);
        envelope.metadata.encrypted = true;
        this.statistics.encryptedCount++;
      }

      // Compress payload if required
      if (this.config.compressPayload || options.compress) {
        envelope.payload = this.compressPayload(envelope.payload);
        envelope.metadata.compressed = true;
      }

      // Add signature if enabled
      if (this.config.enableSignatures || options.sign) {
        envelope.signature = this.signEnvelope(envelope);
        envelope.metadata.signed = true;
        this.statistics.signedCount++;
      }

      // Store envelope
      this.envelopes.set(envelope.id, envelope);

      this.emit('envelopeCreated', {
        id: envelope.id,
        size: this.estimateSize(envelope)
      });

      return envelope;
    } catch (error) {
      this.statistics.errors++;
      this.emit('wrapError', { error: error.message, payload });
      throw error;
    }
  }

  /**
   * Unwrap envelope to get payload
   */
  unwrap(envelope, options = {}) {
    try {
      this.statistics.envelopesUnwrapped++;

      // Validate envelope structure
      this.validateEnvelope(envelope);

      // Verify signature if present
      if (envelope.signature) {
        if (!this.verifySignature(envelope)) {
          throw new Error('Invalid envelope signature');
        }
      }

      // Check authentication if required
      if (this.config.requireAuth && !envelope.authentication) {
        throw new Error('Authentication required but not provided');
      }

      let payload = envelope.payload;

      // Decompress if needed
      if (envelope.metadata.compressed) {
        payload = this.decompressPayload(payload);
      }

      // Decrypt if needed
      if (envelope.metadata.encrypted) {
        payload = this.decryptPayload(payload);
      }

      this.emit('envelopeUnwrapped', {
        id: envelope.id,
        timestamp: Date.now()
      });

      return {
        payload,
        metadata: envelope.metadata,
        headers: envelope.headers,
        routing: envelope.routing
      };
    } catch (error) {
      this.statistics.errors++;
      this.emit('unwrapError', { error: error.message, envelope });
      throw error;
    }
  }

  /**
   * Create headers for envelope
   */
  createHeaders(customHeaders = {}) {
    return {
      'Content-Type': 'application/json',
      'X-Message-ID': this.generateId(),
      'X-Timestamp': new Date().toISOString(),
      'X-Version': this.config.version,
      ...customHeaders
    };
  }

  /**
   * Create metadata for envelope
   */
  createMetadata(payload, customMetadata = {}) {
    return {
      size: this.estimateSize(payload),
      type: typeof payload,
      encrypted: false,
      compressed: false,
      signed: false,
      createdAt: Date.now(),
      ...customMetadata
    };
  }

  /**
   * Validate envelope structure
   */
  validateEnvelope(envelope) {
    const required = ['id', 'version', 'timestamp', 'headers', 'metadata', 'payload'];

    for (const field of required) {
      if (!(field in envelope)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (envelope.version !== this.config.version) {
      this.emit('versionMismatch', {
        expected: this.config.version,
        received: envelope.version
      });
    }

    return true;
  }

  /**
   * Encrypt payload
   */
  encryptPayload(payload) {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not configured');
    }

    const algorithm = 'aes-256-cbc';
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    const payloadString = JSON.stringify(payload);
    let encrypted = cipher.update(payloadString, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      algorithm
    };
  }

  /**
   * Decrypt payload
   */
  decryptPayload(encryptedData) {
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
   * Compress payload (simplified)
   */
  compressPayload(payload) {
    const payloadString = JSON.stringify(payload);
    const compressed = Buffer.from(payloadString).toString('base64');
    return { compressed, originalSize: payloadString.length };
  }

  /**
   * Decompress payload (simplified)
   */
  decompressPayload(compressedData) {
    const decompressed = Buffer.from(compressedData.compressed, 'base64').toString('utf8');
    return JSON.parse(decompressed);
  }

  /**
   * Sign envelope
   */
  signEnvelope(envelope) {
    const dataToSign = JSON.stringify({
      id: envelope.id,
      timestamp: envelope.timestamp,
      payload: envelope.payload
    });

    const signature = crypto
      .createHash('sha256')
      .update(dataToSign)
      .digest('hex');

    return signature;
  }

  /**
   * Verify envelope signature
   */
  verifySignature(envelope) {
    const expectedSignature = this.signEnvelope(envelope);
    return envelope.signature === expectedSignature;
  }

  /**
   * Add routing information
   */
  addRouting(envelope, routing) {
    envelope.routing = {
      ...envelope.routing,
      ...routing,
      updatedAt: Date.now()
    };

    this.emit('routingUpdated', {
      id: envelope.id,
      routing: envelope.routing
    });

    return envelope;
  }

  /**
   * Add authentication
   */
  addAuthentication(envelope, auth) {
    envelope.authentication = {
      ...auth,
      addedAt: Date.now()
    };

    this.emit('authenticationAdded', {
      id: envelope.id,
      type: auth.type || 'unknown'
    });

    return envelope;
  }

  /**
   * Update headers
   */
  updateHeaders(envelope, headers) {
    envelope.headers = {
      ...envelope.headers,
      ...headers
    };

    this.emit('headersUpdated', {
      id: envelope.id,
      headers: Object.keys(headers)
    });

    return envelope;
  }

  /**
   * Clone envelope
   */
  cloneEnvelope(envelope) {
    const cloned = JSON.parse(JSON.stringify(envelope));
    cloned.id = this.generateId();
    cloned.timestamp = Date.now();
    cloned.metadata.clonedFrom = envelope.id;

    this.envelopes.set(cloned.id, cloned);

    return cloned;
  }

  /**
   * Batch wrap multiple payloads
   */
  wrapBatch(payloads, options = {}) {
    const envelopes = [];
    const errors = [];

    payloads.forEach((payload, index) => {
      try {
        const envelope = this.wrap(payload, options);
        envelopes.push(envelope);
      } catch (error) {
        errors.push({ index, payload, error: error.message });
      }
    });

    this.emit('batchWrapped', {
      total: payloads.length,
      success: envelopes.length,
      failed: errors.length
    });

    return { envelopes, errors };
  }

  /**
   * Batch unwrap multiple envelopes
   */
  unwrapBatch(envelopes, options = {}) {
    const payloads = [];
    const errors = [];

    envelopes.forEach((envelope, index) => {
      try {
        const unwrapped = this.unwrap(envelope, options);
        payloads.push(unwrapped);
      } catch (error) {
        errors.push({ index, envelope, error: error.message });
      }
    });

    this.emit('batchUnwrapped', {
      total: envelopes.length,
      success: payloads.length,
      failed: errors.length
    });

    return { payloads, errors };
  }

  /**
   * Get envelope by ID
   */
  getEnvelope(id) {
    return this.envelopes.get(id);
  }

  /**
   * Remove envelope
   */
  removeEnvelope(id) {
    const removed = this.envelopes.delete(id);
    if (removed) {
      this.emit('envelopeRemoved', { id });
    }
    return removed;
  }

  /**
   * Get all envelopes
   */
  getAllEnvelopes() {
    return Array.from(this.envelopes.values());
  }

  /**
   * Clear all envelopes
   */
  clear() {
    const count = this.envelopes.size;
    this.envelopes.clear();
    this.emit('cleared', { count });
    return count;
  }

  /**
   * Estimate size in bytes
   */
  estimateSize(data) {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `env-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      ...this.statistics,
      activeEnvelopes: this.envelopes.size,
      errorRate: this.statistics.envelopesCreated > 0
        ? ((this.statistics.errors / this.statistics.envelopesCreated) * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }

  /**
   * Reset statistics
   */
  resetStatistics() {
    this.statistics = {
      envelopesCreated: 0,
      envelopesUnwrapped: 0,
      encryptedCount: 0,
      signedCount: 0,
      errors: 0
    };
  }

  /**
   * Execute pattern demonstration
   */
  execute() {
    console.log('EnvelopeWrapper Pattern - Wrapping messages with metadata');

    // Wrap payload
    const envelope = this.wrap({ message: 'Hello World', data: [1, 2, 3] }, {
      headers: { 'X-Priority': 'high' },
      routing: { destination: 'service-a' }
    });

    console.log('Envelope created:', envelope.id);
    console.log('Headers:', Object.keys(envelope.headers).length);

    // Unwrap payload
    const unwrapped = this.unwrap(envelope);
    console.log('Payload unwrapped:', unwrapped.payload.message);

    console.log('Statistics:', this.getStatistics());

    return {
      success: true,
      pattern: 'EnvelopeWrapper',
      statistics: this.getStatistics()
    };
  }
}

module.exports = EnvelopeWrapper;
