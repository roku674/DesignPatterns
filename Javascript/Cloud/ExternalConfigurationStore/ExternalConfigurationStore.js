/**
 * External Configuration Store Pattern
 *
 * Centralizes configuration management by storing configuration information
 * in an external location, separate from the application deployment package.
 * This enables dynamic configuration updates, environment-specific settings,
 * and configuration sharing across multiple instances.
 *
 * Key Concepts:
 * - Centralized Configuration: Single source of truth for all config
 * - Dynamic Updates: Change configuration without redeployment
 * - Environment Separation: Different configs for dev, staging, production
 * - Configuration Versioning: Track and rollback configuration changes
 * - Secret Management: Secure storage of sensitive configuration
 * - Configuration Caching: Local caching with refresh strategies
 */

/**
 * Configuration Store Interface
 */
class ConfigurationStore {
  constructor() {
    if (this.constructor === ConfigurationStore) {
      throw new Error('ConfigurationStore is abstract and cannot be instantiated');
    }
  }

  async get(key) {
    throw new Error('Method get() must be implemented');
  }

  async set(key, value) {
    throw new Error('Method set() must be implemented');
  }

  async delete(key) {
    throw new Error('Method delete() must be implemented');
  }

  async getAll() {
    throw new Error('Method getAll() must be implemented');
  }
}

/**
 * In-Memory Configuration Store
 * For testing and development
 */
class InMemoryConfigStore extends ConfigurationStore {
  constructor() {
    super();
    this.store = new Map();
  }

  async get(key) {
    if (!key) {
      throw new Error('Key is required');
    }
    return this.store.get(key);
  }

  async set(key, value) {
    if (!key) {
      throw new Error('Key is required');
    }
    this.store.set(key, value);
    return true;
  }

  async delete(key) {
    if (!key) {
      throw new Error('Key is required');
    }
    return this.store.delete(key);
  }

  async getAll() {
    return Object.fromEntries(this.store);
  }

  async clear() {
    this.store.clear();
  }
}

/**
 * File-Based Configuration Store
 * Stores configuration in local files (JSON/YAML)
 */
class FileConfigStore extends ConfigurationStore {
  constructor(filePath) {
    super();
    if (!filePath) {
      throw new Error('File path is required');
    }
    this.filePath = filePath;
    this.config = {};
    this.loaded = false;
  }

  async load() {
    try {
      const fs = require('fs').promises;
      const content = await fs.readFile(this.filePath, 'utf-8');

      if (this.filePath.endsWith('.json')) {
        this.config = JSON.parse(content);
      } else if (this.filePath.endsWith('.yaml') || this.filePath.endsWith('.yml')) {
        throw new Error('YAML parsing not implemented - use JSON');
      } else {
        throw new Error('Unsupported file format');
      }

      this.loaded = true;
      return this.config;
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.config = {};
        this.loaded = true;
        return this.config;
      }
      throw error;
    }
  }

  async save() {
    const fs = require('fs').promises;
    const content = JSON.stringify(this.config, null, 2);
    await fs.writeFile(this.filePath, content, 'utf-8');
  }

  async get(key) {
    if (!this.loaded) {
      await this.load();
    }
    if (!key) {
      throw new Error('Key is required');
    }

    const keys = key.split('.');
    let value = this.config;

    for (const k of keys) {
      if (value === undefined || value === null) {
        return undefined;
      }
      value = value[k];
    }

    return value;
  }

  async set(key, value) {
    if (!this.loaded) {
      await this.load();
    }
    if (!key) {
      throw new Error('Key is required');
    }

    const keys = key.split('.');
    let current = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!current[k] || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }

    current[keys[keys.length - 1]] = value;
    await this.save();
    return true;
  }

  async delete(key) {
    if (!this.loaded) {
      await this.load();
    }
    if (!key) {
      throw new Error('Key is required');
    }

    const keys = key.split('.');
    let current = this.config;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!current[k]) {
        return false;
      }
      current = current[k];
    }

    const deleted = delete current[keys[keys.length - 1]];
    if (deleted) {
      await this.save();
    }
    return deleted;
  }

  async getAll() {
    if (!this.loaded) {
      await this.load();
    }
    return { ...this.config };
  }
}

/**
 * Simulated Remote Configuration Store
 * Simulates cloud-based configuration service (AWS AppConfig, Azure App Configuration, etc.)
 */
class RemoteConfigStore extends ConfigurationStore {
  constructor(endpoint, apiKey) {
    super();
    if (!endpoint) {
      throw new Error('Endpoint is required');
    }
    this.endpoint = endpoint;
    this.apiKey = apiKey;
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.cacheTTL = 60000; // 1 minute
  }

  async get(key) {
    if (!key) {
      throw new Error('Key is required');
    }

    const cached = this.cache.get(key);
    const expiry = this.cacheExpiry.get(key);

    if (cached !== undefined && expiry && Date.now() < expiry) {
      return cached;
    }

    try {
      const response = await this.makeRequest('GET', `/config/${key}`);
      const value = response.value;

      this.cache.set(key, value);
      this.cacheExpiry.set(key, Date.now() + this.cacheTTL);

      return value;
    } catch (error) {
      if (cached !== undefined) {
        return cached;
      }
      throw error;
    }
  }

  async set(key, value) {
    if (!key) {
      throw new Error('Key is required');
    }

    await this.makeRequest('PUT', `/config/${key}`, { value });

    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + this.cacheTTL);

    return true;
  }

  async delete(key) {
    if (!key) {
      throw new Error('Key is required');
    }

    await this.makeRequest('DELETE', `/config/${key}`);

    this.cache.delete(key);
    this.cacheExpiry.delete(key);

    return true;
  }

  async getAll() {
    const response = await this.makeRequest('GET', '/config');
    return response.data || {};
  }

  async makeRequest(method, path, body = null) {
    return {
      success: true,
      value: body ? body.value : undefined,
      data: {}
    };
  }

  clearCache() {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  setCacheTTL(ttl) {
    if (typeof ttl !== 'number' || ttl < 0) {
      throw new Error('TTL must be a non-negative number');
    }
    this.cacheTTL = ttl;
  }
}

/**
 * Configuration Manager
 * Manages configuration with versioning, environment support, and caching
 */
class ConfigurationManager {
  constructor(store, config = {}) {
    if (!(store instanceof ConfigurationStore)) {
      throw new Error('Store must be an instance of ConfigurationStore');
    }

    this.store = store;
    this.environment = config.environment || 'development';
    this.version = config.version || '1.0.0';
    this.cache = new Map();
    this.cacheEnabled = config.cacheEnabled !== false;
    this.cacheTTL = config.cacheTTL || 60000;
    this.refreshInterval = config.refreshInterval || 0;
    this.refreshTimer = null;
    this.watchers = new Map();
  }

  /**
   * Get configuration value
   */
  async get(key, defaultValue = undefined) {
    if (!key) {
      throw new Error('Key is required');
    }

    const fullKey = this.buildKey(key);

    if (this.cacheEnabled) {
      const cached = this.cache.get(fullKey);
      if (cached && Date.now() < cached.expiry) {
        return cached.value;
      }
    }

    try {
      const value = await this.store.get(fullKey);

      if (value === undefined && defaultValue !== undefined) {
        return defaultValue;
      }

      if (this.cacheEnabled && value !== undefined) {
        this.cache.set(fullKey, {
          value,
          expiry: Date.now() + this.cacheTTL
        });
      }

      return value;
    } catch (error) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw error;
    }
  }

  /**
   * Set configuration value
   */
  async set(key, value) {
    if (!key) {
      throw new Error('Key is required');
    }

    const fullKey = this.buildKey(key);
    const oldValue = await this.get(key);

    await this.store.set(fullKey, value);

    if (this.cacheEnabled) {
      this.cache.set(fullKey, {
        value,
        expiry: Date.now() + this.cacheTTL
      });
    }

    this.notifyWatchers(key, oldValue, value);

    return true;
  }

  /**
   * Delete configuration value
   */
  async delete(key) {
    if (!key) {
      throw new Error('Key is required');
    }

    const fullKey = this.buildKey(key);
    const oldValue = await this.get(key);

    await this.store.delete(fullKey);

    if (this.cacheEnabled) {
      this.cache.delete(fullKey);
    }

    this.notifyWatchers(key, oldValue, undefined);

    return true;
  }

  /**
   * Get all configuration values
   */
  async getAll() {
    const all = await this.store.getAll();
    const prefix = `${this.environment}:${this.version}:`;

    const filtered = {};
    for (const [key, value] of Object.entries(all)) {
      if (key.startsWith(prefix)) {
        const shortKey = key.substring(prefix.length);
        filtered[shortKey] = value;
      }
    }

    return filtered;
  }

  /**
   * Watch for configuration changes
   */
  watch(key, callback) {
    if (!key) {
      throw new Error('Key is required');
    }
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    if (!this.watchers.has(key)) {
      this.watchers.set(key, new Set());
    }

    this.watchers.get(key).add(callback);

    return () => {
      const watchers = this.watchers.get(key);
      if (watchers) {
        watchers.delete(callback);
        if (watchers.size === 0) {
          this.watchers.delete(key);
        }
      }
    };
  }

  /**
   * Notify watchers of configuration changes
   */
  notifyWatchers(key, oldValue, newValue) {
    const watchers = this.watchers.get(key);
    if (watchers) {
      for (const callback of watchers) {
        try {
          callback(newValue, oldValue, key);
        } catch (error) {
          console.error(`Error in config watcher for key ${key}:`, error);
        }
      }
    }
  }

  /**
   * Build full key with environment and version
   */
  buildKey(key) {
    return `${this.environment}:${this.version}:${key}`;
  }

  /**
   * Start automatic refresh
   */
  startRefresh() {
    if (this.refreshInterval <= 0 || this.refreshTimer) {
      return;
    }

    this.refreshTimer = setInterval(async () => {
      await this.refresh();
    }, this.refreshInterval);
  }

  /**
   * Stop automatic refresh
   */
  stopRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Refresh configuration cache
   */
  async refresh() {
    const all = await this.getAll();

    for (const [key, value] of Object.entries(all)) {
      const fullKey = this.buildKey(key);
      const cached = this.cache.get(fullKey);

      if (cached && cached.value !== value) {
        this.notifyWatchers(key, cached.value, value);
      }

      if (this.cacheEnabled) {
        this.cache.set(fullKey, {
          value,
          expiry: Date.now() + this.cacheTTL
        });
      }
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get configuration metadata
   */
  getMetadata() {
    return {
      environment: this.environment,
      version: this.version,
      cacheEnabled: this.cacheEnabled,
      cacheTTL: this.cacheTTL,
      cacheSize: this.cache.size,
      refreshInterval: this.refreshInterval,
      watcherCount: this.watchers.size
    };
  }
}

/**
 * Configuration Builder
 * Fluent API for building configuration
 */
class ConfigurationBuilder {
  constructor() {
    this.storeType = 'memory';
    this.storeConfig = {};
    this.managerConfig = {};
  }

  /**
   * Set store type
   */
  useStore(type, config = {}) {
    this.storeType = type;
    this.storeConfig = config;
    return this;
  }

  /**
   * Set environment
   */
  withEnvironment(environment) {
    if (!environment) {
      throw new Error('Environment is required');
    }
    this.managerConfig.environment = environment;
    return this;
  }

  /**
   * Set version
   */
  withVersion(version) {
    if (!version) {
      throw new Error('Version is required');
    }
    this.managerConfig.version = version;
    return this;
  }

  /**
   * Enable caching
   */
  withCache(ttl = 60000) {
    this.managerConfig.cacheEnabled = true;
    this.managerConfig.cacheTTL = ttl;
    return this;
  }

  /**
   * Enable auto-refresh
   */
  withRefresh(interval) {
    if (typeof interval !== 'number' || interval <= 0) {
      throw new Error('Refresh interval must be a positive number');
    }
    this.managerConfig.refreshInterval = interval;
    return this;
  }

  /**
   * Build configuration manager
   */
  build() {
    let store;

    switch (this.storeType) {
      case 'memory':
        store = new InMemoryConfigStore();
        break;
      case 'file':
        if (!this.storeConfig.filePath) {
          throw new Error('File path is required for file store');
        }
        store = new FileConfigStore(this.storeConfig.filePath);
        break;
      case 'remote':
        if (!this.storeConfig.endpoint) {
          throw new Error('Endpoint is required for remote store');
        }
        store = new RemoteConfigStore(
          this.storeConfig.endpoint,
          this.storeConfig.apiKey
        );
        break;
      default:
        throw new Error(`Unknown store type: ${this.storeType}`);
    }

    return new ConfigurationManager(store, this.managerConfig);
  }
}

/**
 * Main External Configuration Store class
 */
class ExternalConfigurationStore {
  static createBuilder() {
    return new ConfigurationBuilder();
  }

  static createManager(store, config) {
    return new ConfigurationManager(store, config);
  }

  static createInMemoryStore() {
    return new InMemoryConfigStore();
  }

  static createFileStore(filePath) {
    return new FileConfigStore(filePath);
  }

  static createRemoteStore(endpoint, apiKey) {
    return new RemoteConfigStore(endpoint, apiKey);
  }
}

module.exports = {
  ExternalConfigurationStore,
  ConfigurationStore,
  InMemoryConfigStore,
  FileConfigStore,
  RemoteConfigStore,
  ConfigurationManager,
  ConfigurationBuilder
};
