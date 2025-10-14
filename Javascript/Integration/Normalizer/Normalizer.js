/**
 * Normalizer Pattern
 *
 * Routes messages through a translator that converts different message formats
 * into a common format. Useful when receiving messages from multiple sources
 * with varying formats.
 */

const EventEmitter = require('events');

class Normalizer extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      strictMode: config.strictMode || false,
      cacheNormalizations: config.cacheNormalizations !== false,
      maxCacheSize: config.maxCacheSize || 1000,
      ...config
    };

    this.normalizers = new Map();
    this.normalizationCache = new Map();
    this.statistics = {
      normalized: 0,
      cacheHits: 0,
      cacheMisses: 0,
      failures: 0
    };

    this.registerDefaultNormalizers();
  }

  /**
   * Register default normalizers
   */
  registerDefaultNormalizers() {
    // Normalize dates
    this.registerNormalizer('date', (value) => {
      if (value instanceof Date) return value.toISOString();
      if (typeof value === 'number') return new Date(value).toISOString();
      if (typeof value === 'string') {
        const date = new Date(value);
        return isNaN(date.getTime()) ? value : date.toISOString();
      }
      return value;
    });

    // Normalize booleans
    this.registerNormalizer('boolean', (value) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const lower = value.toLowerCase();
        if (lower === 'true' || lower === 'yes' || lower === '1') return true;
        if (lower === 'false' || lower === 'no' || lower === '0') return false;
      }
      if (typeof value === 'number') return value !== 0;
      return Boolean(value);
    });

    // Normalize numbers
    this.registerNormalizer('number', (value) => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const num = parseFloat(value);
        return isNaN(num) ? value : num;
      }
      return value;
    });

    // Normalize strings
    this.registerNormalizer('string', (value) => {
      if (value === null || value === undefined) return '';
      return String(value);
    });

    // Normalize phone numbers
    this.registerNormalizer('phone', (value) => {
      if (typeof value !== 'string') value = String(value);
      return value.replace(/\D/g, '');
    });

    // Normalize email addresses
    this.registerNormalizer('email', (value) => {
      if (typeof value !== 'string') value = String(value);
      return value.toLowerCase().trim();
    });

    // Normalize currency
    this.registerNormalizer('currency', (value) => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const cleaned = value.replace(/[$,]/g, '');
        const num = parseFloat(cleaned);
        return isNaN(num) ? value : num;
      }
      return value;
    });
  }

  /**
   * Register a custom normalizer
   */
  registerNormalizer(type, normalizerFn) {
    if (typeof normalizerFn !== 'function') {
      throw new Error('Normalizer must be a function');
    }

    this.normalizers.set(type, normalizerFn);

    this.emit('normalizerRegistered', { type });
  }

  /**
   * Normalize a message
   */
  normalize(message, schema) {
    try {
      this.statistics.normalized++;

      // Check cache
      const cacheKey = this.generateCacheKey(message, schema);
      if (this.config.cacheNormalizations && this.normalizationCache.has(cacheKey)) {
        this.statistics.cacheHits++;
        return this.normalizationCache.get(cacheKey);
      }

      this.statistics.cacheMisses++;

      const normalized = this.normalizeObject(message, schema);

      // Cache result
      if (this.config.cacheNormalizations) {
        if (this.normalizationCache.size >= this.config.maxCacheSize) {
          const firstKey = this.normalizationCache.keys().next().value;
          this.normalizationCache.delete(firstKey);
        }
        this.normalizationCache.set(cacheKey, normalized);
      }

      this.emit('messageNormalized', {
        originalKeys: Object.keys(message).length,
        normalizedKeys: Object.keys(normalized).length
      });

      return normalized;
    } catch (error) {
      this.statistics.failures++;
      this.emit('normalizationError', { error: error.message });

      if (this.config.strictMode) {
        throw error;
      }

      return message;
    }
  }

  /**
   * Normalize an object based on schema
   */
  normalizeObject(obj, schema) {
    const normalized = {};

    for (const [key, definition] of Object.entries(schema)) {
      let value = obj[key];

      // Handle missing values
      if (value === undefined || value === null) {
        if (definition.required) {
          if (this.config.strictMode) {
            throw new Error(`Required field ${key} is missing`);
          }
        }
        value = definition.default !== undefined ? definition.default : null;
      }

      // Apply normalizer
      if (definition.type && this.normalizers.has(definition.type)) {
        const normalizer = this.normalizers.get(definition.type);
        value = normalizer(value);
      }

      // Handle nested objects
      if (definition.schema && typeof value === 'object' && value !== null) {
        value = this.normalizeObject(value, definition.schema);
      }

      // Handle arrays
      if (definition.items && Array.isArray(value)) {
        value = value.map(item => {
          if (definition.items.schema) {
            return this.normalizeObject(item, definition.items.schema);
          }
          if (definition.items.type && this.normalizers.has(definition.items.type)) {
            const normalizer = this.normalizers.get(definition.items.type);
            return normalizer(item);
          }
          return item;
        });
      }

      // Apply custom transform
      if (definition.transform && typeof definition.transform === 'function') {
        value = definition.transform(value);
      }

      // Apply validation
      if (definition.validate && typeof definition.validate === 'function') {
        if (!definition.validate(value)) {
          if (this.config.strictMode) {
            throw new Error(`Validation failed for field ${key}`);
          }
        }
      }

      normalized[key] = value;
    }

    return normalized;
  }

  /**
   * Batch normalize messages
   */
  normalizeBatch(messages, schema) {
    const results = {
      normalized: [],
      failed: []
    };

    messages.forEach((message, index) => {
      try {
        const normalized = this.normalize(message, schema);
        results.normalized.push(normalized);
      } catch (error) {
        results.failed.push({
          index,
          message,
          error: error.message
        });
      }
    });

    this.emit('batchNormalized', {
      total: messages.length,
      success: results.normalized.length,
      failed: results.failed.length
    });

    return results;
  }

  /**
   * Normalize message from specific format
   */
  normalizeFrom(message, sourceFormat, targetSchema) {
    // First, convert format-specific structure
    let intermediate = message;

    switch (sourceFormat) {
      case 'xml':
        intermediate = this.xmlToObject(message);
        break;
      case 'csv':
        intermediate = this.csvToObject(message);
        break;
      case 'json':
        intermediate = typeof message === 'string' ? JSON.parse(message) : message;
        break;
    }

    // Then normalize to target schema
    return this.normalize(intermediate, targetSchema);
  }

  /**
   * Convert XML to object (simplified)
   */
  xmlToObject(xmlString) {
    const obj = {};
    const tagRegex = /<([^>]+)>([^<]*)<\/\1>/g;
    let match;

    while ((match = tagRegex.exec(xmlString)) !== null) {
      obj[match[1]] = match[2];
    }

    return obj;
  }

  /**
   * Convert CSV to object (simplified)
   */
  csvToObject(csvString) {
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) return {};

    const headers = lines[0].split(',').map(h => h.trim());
    const values = lines[1].split(',').map(v => v.trim());

    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index];
    });

    return obj;
  }

  /**
   * Create a normalization schema
   */
  createSchema(fields) {
    const schema = {};

    fields.forEach(field => {
      schema[field.name] = {
        type: field.type || 'string',
        required: field.required || false,
        default: field.default,
        transform: field.transform,
        validate: field.validate,
        schema: field.schema,
        items: field.items
      };
    });

    return schema;
  }

  /**
   * Generate cache key
   */
  generateCacheKey(message, schema) {
    try {
      return JSON.stringify({ message, schema });
    } catch {
      return `${Date.now()}-${Math.random()}`;
    }
  }

  /**
   * Clear normalization cache
   */
  clearCache() {
    const size = this.normalizationCache.size;
    this.normalizationCache.clear();
    this.emit('cacheCleared', { size });
    return size;
  }

  /**
   * Get available normalizer types
   */
  getAvailableTypes() {
    return Array.from(this.normalizers.keys());
  }

  /**
   * Remove normalizer
   */
  removeNormalizer(type) {
    const removed = this.normalizers.delete(type);
    if (removed) {
      this.emit('normalizerRemoved', { type });
    }
    return removed;
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      ...this.statistics,
      cacheSize: this.normalizationCache.size,
      cacheHitRate: this.statistics.cacheMisses > 0
        ? ((this.statistics.cacheHits / (this.statistics.cacheHits + this.statistics.cacheMisses)) * 100).toFixed(2) + '%'
        : 'N/A',
      successRate: this.statistics.normalized > 0
        ? (((this.statistics.normalized - this.statistics.failures) / this.statistics.normalized) * 100).toFixed(2) + '%'
        : 'N/A',
      normalizersRegistered: this.normalizers.size
    };
  }

  /**
   * Reset statistics
   */
  resetStatistics() {
    this.statistics = {
      normalized: 0,
      cacheHits: 0,
      cacheMisses: 0,
      failures: 0
    };
  }

  /**
   * Execute pattern demonstration
   */
  execute() {
    console.log('Normalizer Pattern - Converting messages to common format');

    // Define schema
    const schema = this.createSchema([
      { name: 'name', type: 'string', required: true },
      { name: 'age', type: 'number', required: true },
      { name: 'active', type: 'boolean' },
      { name: 'email', type: 'email' },
      { name: 'phone', type: 'phone' },
      { name: 'created', type: 'date' }
    ]);

    // Normalize messages from different sources
    const message1 = {
      name: 'John Doe',
      age: '30',
      active: 'yes',
      email: 'JOHN@EXAMPLE.COM',
      phone: '(555) 123-4567',
      created: '2024-01-01'
    };

    const normalized = this.normalize(message1, schema);
    console.log('Normalized:', {
      age: typeof normalized.age,
      active: typeof normalized.active,
      email: normalized.email,
      phone: normalized.phone
    });

    console.log('Statistics:', this.getStatistics());

    return {
      success: true,
      pattern: 'Normalizer',
      statistics: this.getStatistics()
    };
  }
}

module.exports = Normalizer;
