/**
 * Bridge Pattern - REAL Production Implementation
 *
 * Real data storage bridge with actual storage backends (memory, file system).
 * Separates abstraction (data operations) from implementation (storage mechanism).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ============= Implementation Interface =============

/**
 * Storage implementation interface
 */
class StorageImpl {
  async save(key, value) {
    throw new Error('Method save() must be implemented');
  }

  async load(key) {
    throw new Error('Method load() must be implemented');
  }

  async delete(key) {
    throw new Error('Method delete() must be implemented');
  }

  async exists(key) {
    throw new Error('Method exists() must be implemented');
  }

  async list() {
    throw new Error('Method list() must be implemented');
  }

  async clear() {
    throw new Error('Method clear() must be implemented');
  }
}

// ============= Concrete Implementations =============

/**
 * Memory Storage - Fast, volatile storage
 */
class MemoryStorage extends StorageImpl {
  constructor() {
    super();
    this.data = new Map();
    this.metadata = new Map();
  }

  async save(key, value) {
    return new Promise((resolve) => {
      this.data.set(key, value);
      this.metadata.set(key, {
        created: Date.now(),
        modified: Date.now(),
        size: JSON.stringify(value).length
      });
      resolve(true);
    });
  }

  async load(key) {
    return new Promise((resolve, reject) => {
      if (!this.data.has(key)) {
        reject(new Error(`Key not found: ${key}`));
        return;
      }
      resolve(this.data.get(key));
    });
  }

  async delete(key) {
    return new Promise((resolve) => {
      const result = this.data.delete(key);
      this.metadata.delete(key);
      resolve(result);
    });
  }

  async exists(key) {
    return new Promise((resolve) => {
      resolve(this.data.has(key));
    });
  }

  async list() {
    return new Promise((resolve) => {
      resolve(Array.from(this.data.keys()));
    });
  }

  async clear() {
    return new Promise((resolve) => {
      this.data.clear();
      this.metadata.clear();
      resolve(true);
    });
  }

  async getMetadata(key) {
    return this.metadata.get(key);
  }

  getSize() {
    return this.data.size;
  }
}

/**
 * File Storage - Persistent file-based storage
 */
class FileStorage extends StorageImpl {
  constructor(baseDir = './storage') {
    super();
    this.baseDir = baseDir;
    this.ensureDirectory();
  }

  ensureDirectory() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  getFilePath(key) {
    const safeKey = crypto.createHash('md5').update(key).digest('hex');
    return path.join(this.baseDir, `${safeKey}.json`);
  }

  async save(key, value) {
    return new Promise((resolve, reject) => {
      try {
        const filePath = this.getFilePath(key);
        const data = {
          key: key,
          value: value,
          timestamp: Date.now()
        };
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  async load(key) {
    return new Promise((resolve, reject) => {
      try {
        const filePath = this.getFilePath(key);
        if (!fs.existsSync(filePath)) {
          reject(new Error(`Key not found: ${key}`));
          return;
        }
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        resolve(data.value);
      } catch (error) {
        reject(error);
      }
    });
  }

  async delete(key) {
    return new Promise((resolve, reject) => {
      try {
        const filePath = this.getFilePath(key);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  async exists(key) {
    return new Promise((resolve) => {
      const filePath = this.getFilePath(key);
      resolve(fs.existsSync(filePath));
    });
  }

  async list() {
    return new Promise((resolve, reject) => {
      try {
        const files = fs.readdirSync(this.baseDir);
        const keys = files
          .filter(file => file.endsWith('.json'))
          .map(file => {
            const content = fs.readFileSync(path.join(this.baseDir, file), 'utf8');
            return JSON.parse(content).key;
          });
        resolve(keys);
      } catch (error) {
        reject(error);
      }
    });
  }

  async clear() {
    return new Promise((resolve, reject) => {
      try {
        const files = fs.readdirSync(this.baseDir);
        files.forEach(file => {
          fs.unlinkSync(path.join(this.baseDir, file));
        });
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getSize() {
    const files = fs.readdirSync(this.baseDir);
    return files.filter(f => f.endsWith('.json')).length;
  }
}

/**
 * Compressed Storage - Storage with compression
 */
class CompressedStorage extends StorageImpl {
  constructor(baseStorage) {
    super();
    this.storage = baseStorage;
  }

  compress(data) {
    // Simple compression simulation (in real app, use zlib)
    const json = JSON.stringify(data);
    return Buffer.from(json).toString('base64');
  }

  decompress(compressed) {
    // Simple decompression simulation
    const json = Buffer.from(compressed, 'base64').toString('utf8');
    return JSON.parse(json);
  }

  async save(key, value) {
    const compressed = this.compress(value);
    return this.storage.save(key, compressed);
  }

  async load(key) {
    const compressed = await this.storage.load(key);
    return this.decompress(compressed);
  }

  async delete(key) {
    return this.storage.delete(key);
  }

  async exists(key) {
    return this.storage.exists(key);
  }

  async list() {
    return this.storage.list();
  }

  async clear() {
    return this.storage.clear();
  }
}

// ============= Abstraction =============

/**
 * Data Repository - High-level abstraction
 */
class DataRepository {
  constructor(storage) {
    if (!storage) {
      throw new Error('Storage implementation is required');
    }
    this.storage = storage;
  }

  setStorage(storage) {
    this.storage = storage;
  }

  async create(key, value) {
    throw new Error('Method create() must be implemented');
  }

  async read(key) {
    throw new Error('Method read() must be implemented');
  }

  async update(key, value) {
    throw new Error('Method update() must be implemented');
  }

  async delete(key) {
    throw new Error('Method delete() must be implemented');
  }
}

// ============= Refined Abstractions =============

/**
 * Simple Repository - Basic CRUD operations
 */
class SimpleRepository extends DataRepository {
  constructor(storage) {
    super(storage);
  }

  async create(key, value) {
    const exists = await this.storage.exists(key);
    if (exists) {
      throw new Error(`Key already exists: ${key}`);
    }
    await this.storage.save(key, value);
    return { success: true, key, message: 'Created successfully' };
  }

  async read(key) {
    const value = await this.storage.load(key);
    return { success: true, key, value };
  }

  async update(key, value) {
    const exists = await this.storage.exists(key);
    if (!exists) {
      throw new Error(`Key not found: ${key}`);
    }
    await this.storage.save(key, value);
    return { success: true, key, message: 'Updated successfully' };
  }

  async delete(key) {
    const result = await this.storage.delete(key);
    if (!result) {
      throw new Error(`Key not found: ${key}`);
    }
    return { success: true, key, message: 'Deleted successfully' };
  }

  async list() {
    const keys = await this.storage.list();
    return { success: true, keys, count: keys.length };
  }

  async clear() {
    await this.storage.clear();
    return { success: true, message: 'All data cleared' };
  }
}

/**
 * Cached Repository - Repository with caching layer
 */
class CachedRepository extends DataRepository {
  constructor(storage) {
    super(storage);
    this.cache = new Map();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  async create(key, value) {
    const exists = await this.storage.exists(key);
    if (exists) {
      throw new Error(`Key already exists: ${key}`);
    }
    await this.storage.save(key, value);
    this.cache.set(key, value);
    return { success: true, key, message: 'Created and cached' };
  }

  async read(key) {
    if (this.cache.has(key)) {
      this.cacheHits++;
      return {
        success: true,
        key,
        value: this.cache.get(key),
        cached: true,
        cacheHits: this.cacheHits
      };
    }

    this.cacheMisses++;
    const value = await this.storage.load(key);
    this.cache.set(key, value);
    return {
      success: true,
      key,
      value,
      cached: false,
      cacheMisses: this.cacheMisses
    };
  }

  async update(key, value) {
    await this.storage.save(key, value);
    this.cache.set(key, value);
    return { success: true, key, message: 'Updated and cache refreshed' };
  }

  async delete(key) {
    await this.storage.delete(key);
    this.cache.delete(key);
    return { success: true, key, message: 'Deleted and cache cleared' };
  }

  async list() {
    const keys = await this.storage.list();
    return { success: true, keys, count: keys.length };
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: this.cacheHits + this.cacheMisses > 0
        ? ((this.cacheHits / (this.cacheHits + this.cacheMisses)) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  clearCache() {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
}

/**
 * Validated Repository - Repository with validation
 */
class ValidatedRepository extends DataRepository {
  constructor(storage, schema) {
    super(storage);
    this.schema = schema || {};
  }

  validate(value) {
    if (this.schema.type && typeof value !== this.schema.type) {
      throw new Error(`Invalid type: expected ${this.schema.type}, got ${typeof value}`);
    }

    if (this.schema.required) {
      for (const field of this.schema.required) {
        if (value[field] === undefined) {
          throw new Error(`Required field missing: ${field}`);
        }
      }
    }

    if (this.schema.validator && typeof this.schema.validator === 'function') {
      const validationResult = this.schema.validator(value);
      if (validationResult !== true) {
        throw new Error(`Validation failed: ${validationResult}`);
      }
    }

    return true;
  }

  async create(key, value) {
    this.validate(value);
    await this.storage.save(key, value);
    return { success: true, key, message: 'Created after validation' };
  }

  async read(key) {
    const value = await this.storage.load(key);
    return { success: true, key, value };
  }

  async update(key, value) {
    this.validate(value);
    await this.storage.save(key, value);
    return { success: true, key, message: 'Updated after validation' };
  }

  async delete(key) {
    await this.storage.delete(key);
    return { success: true, key, message: 'Deleted successfully' };
  }

  async list() {
    const keys = await this.storage.list();
    return { success: true, keys, count: keys.length };
  }
}

module.exports = {
  // Implementations
  MemoryStorage,
  FileStorage,
  CompressedStorage,
  // Abstractions
  SimpleRepository,
  CachedRepository,
  ValidatedRepository,
  // Base classes
  StorageImpl,
  DataRepository
};
