/**
 * Externalized Configuration Pattern
 *
 * Externalizes configuration from the application code so that it can be
 * changed without rebuilding or redeploying the application. Configuration
 * is stored in external sources like config servers, environment variables,
 * or configuration management systems.
 *
 * Key Components:
 * - Configuration Server: Central configuration repository
 * - Configuration Client: Fetches and caches configuration
 * - Environment Profiles: Different configurations for dev/staging/prod
 * - Dynamic Refresh: Update configuration without restart
 * - Encryption: Secure sensitive configuration data
 * - Versioning: Track configuration changes
 */

const EventEmitter = require('events');

/**
 * Configuration Entry
 */
class ConfigEntry {
  constructor(key, value, metadata = {}) {
    this.key = key;
    this.value = value;
    this.type = typeof value;
    this.encrypted = metadata.encrypted || false;
    this.profile = metadata.profile || 'default';
    this.version = metadata.version || 1;
    this.createdAt = metadata.createdAt || new Date().toISOString();
    this.updatedAt = metadata.updatedAt || new Date().toISOString();
    this.metadata = metadata;
  }

  getValue() {
    return this.encrypted ? this.decrypt(this.value) : this.value;
  }

  decrypt(value) {
    // Simple XOR encryption for demo
    return value.split('').map(c => String.fromCharCode(c.charCodeAt(0) ^ 42)).join('');
  }

  encrypt(value) {
    // Simple XOR encryption for demo
    return value.split('').map(c => String.fromCharCode(c.charCodeAt(0) ^ 42)).join('');
  }
}

/**
 * Configuration Server - Central configuration repository
 */
class ConfigurationServer {
  constructor() {
    this.configs = new Map(); // applicationId -> profile -> configs
    this.history = []; // Configuration change history
    this.watchers = new Map(); // applicationId -> watchers
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Set configuration
   */
  set(applicationId, key, value, profile = 'default', metadata = {}) {
    if (!this.configs.has(applicationId)) {
      this.configs.set(applicationId, new Map());
    }

    const appConfigs = this.configs.get(applicationId);

    if (!appConfigs.has(profile)) {
      appConfigs.set(profile, new Map());
    }

    const profileConfigs = appConfigs.get(profile);

    // Update version if exists
    if (profileConfigs.has(key)) {
      const existing = profileConfigs.get(key);
      metadata.version = (existing.version || 0) + 1;
    }

    metadata.updatedAt = new Date().toISOString();
    const entry = new ConfigEntry(key, value, { ...metadata, profile });

    profileConfigs.set(key, entry);

    // Record history
    this.history.push({
      timestamp: new Date().toISOString(),
      applicationId,
      profile,
      key,
      value,
      action: 'set',
      version: entry.version
    });

    // Notify watchers
    this.notifyWatchers(applicationId, profile, key, entry);

    console.log(`Config set: ${applicationId}/${profile}/${key} (v${entry.version})`);
  }

  /**
   * Get configuration
   */
  get(applicationId, key, profile = 'default') {
    const appConfigs = this.configs.get(applicationId);
    if (!appConfigs) {
      return null;
    }

    const profileConfigs = appConfigs.get(profile);
    if (!profileConfigs) {
      return null;
    }

    return profileConfigs.get(key);
  }

  /**
   * Get all configurations for application and profile
   */
  getAll(applicationId, profile = 'default') {
    const appConfigs = this.configs.get(applicationId);
    if (!appConfigs) {
      return {};
    }

    const profileConfigs = appConfigs.get(profile);
    if (!profileConfigs) {
      return {};
    }

    const result = {};
    for (const [key, entry] of profileConfigs) {
      result[key] = entry.getValue();
    }

    return result;
  }

  /**
   * Delete configuration
   */
  delete(applicationId, key, profile = 'default') {
    const appConfigs = this.configs.get(applicationId);
    if (!appConfigs) {
      return false;
    }

    const profileConfigs = appConfigs.get(profile);
    if (!profileConfigs) {
      return false;
    }

    const deleted = profileConfigs.delete(key);

    if (deleted) {
      this.history.push({
        timestamp: new Date().toISOString(),
        applicationId,
        profile,
        key,
        action: 'delete'
      });

      this.notifyWatchers(applicationId, profile, key, null);
    }

    return deleted;
  }

  /**
   * Watch configuration changes
   */
  watch(applicationId, callback) {
    if (!this.watchers.has(applicationId)) {
      this.watchers.set(applicationId, []);
    }

    this.watchers.get(applicationId).push(callback);

    return () => {
      const watchers = this.watchers.get(applicationId);
      const index = watchers.indexOf(callback);
      if (index > -1) {
        watchers.splice(index, 1);
      }
    };
  }

  /**
   * Notify watchers of configuration changes
   */
  notifyWatchers(applicationId, profile, key, entry) {
    const watchers = this.watchers.get(applicationId) || [];

    for (const watcher of watchers) {
      try {
        watcher({ profile, key, value: entry ? entry.getValue() : null });
      } catch (error) {
        console.error('Error in watcher:', error);
      }
    }

    this.eventEmitter.emit('config-changed', { applicationId, profile, key, entry });
  }

  /**
   * Get configuration history
   */
  getHistory(applicationId = null, limit = 10) {
    let history = this.history;

    if (applicationId) {
      history = history.filter(h => h.applicationId === applicationId);
    }

    return history.slice(-limit);
  }

  /**
   * Get server statistics
   */
  getStats() {
    const stats = {
      applications: this.configs.size,
      totalConfigs: 0,
      byProfile: {},
      historySize: this.history.length,
      watchers: this.watchers.size
    };

    for (const [appId, profiles] of this.configs) {
      for (const [profile, configs] of profiles) {
        stats.totalConfigs += configs.size;
        stats.byProfile[profile] = (stats.byProfile[profile] || 0) + configs.size;
      }
    }

    return stats;
  }
}

/**
 * Configuration Client - Fetches and caches configuration
 */
class ConfigurationClient extends EventEmitter {
  constructor(applicationId, configServer, options = {}) {
    super();
    this.applicationId = applicationId;
    this.configServer = configServer;
    this.profile = options.profile || 'default';
    this.cache = new Map();
    this.refreshInterval = options.refreshInterval || 30000; // 30 seconds
    this.autoRefresh = options.autoRefresh !== false;
    this.refreshTimer = null;
    this.lastRefreshAt = null;
    this.unwatchFn = null;
  }

  /**
   * Initialize client
   */
  async initialize() {
    await this.refresh();

    // Setup watcher
    this.unwatchFn = this.configServer.watch(this.applicationId, (change) => {
      this.handleConfigChange(change);
    });

    // Setup auto-refresh
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }

    console.log(`Config client initialized for ${this.applicationId} (${this.profile})`);
  }

  /**
   * Refresh configuration from server
   */
  async refresh() {
    const configs = this.configServer.getAll(this.applicationId, this.profile);

    // Update cache
    this.cache.clear();
    for (const [key, value] of Object.entries(configs)) {
      this.cache.set(key, value);
    }

    this.lastRefreshAt = new Date().toISOString();
    this.emit('refreshed', { profile: this.profile, configCount: this.cache.size });

    console.log(`Configuration refreshed: ${this.cache.size} entries`);
  }

  /**
   * Get configuration value
   */
  get(key, defaultValue = null) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Try to get from server if not in cache
    const entry = this.configServer.get(this.applicationId, key, this.profile);
    if (entry) {
      const value = entry.getValue();
      this.cache.set(key, value);
      return value;
    }

    return defaultValue;
  }

  /**
   * Get all configuration
   */
  getAll() {
    return Object.fromEntries(this.cache);
  }

  /**
   * Handle configuration change
   */
  handleConfigChange(change) {
    if (change.profile !== this.profile) {
      return;
    }

    const oldValue = this.cache.get(change.key);
    const newValue = change.value;

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      if (newValue === null) {
        this.cache.delete(change.key);
      } else {
        this.cache.set(change.key, newValue);
      }

      this.emit('config-changed', {
        key: change.key,
        oldValue,
        newValue
      });

      console.log(`Config changed: ${change.key} (${oldValue} -> ${newValue})`);
    }
  }

  /**
   * Start auto-refresh
   */
  startAutoRefresh() {
    if (this.refreshTimer) {
      return;
    }

    this.refreshTimer = setInterval(() => {
      this.refresh();
    }, this.refreshInterval);
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Shutdown client
   */
  shutdown() {
    this.stopAutoRefresh();

    if (this.unwatchFn) {
      this.unwatchFn();
      this.unwatchFn = null;
    }

    console.log(`Config client shutdown for ${this.applicationId}`);
  }

  /**
   * Get client statistics
   */
  getStats() {
    return {
      applicationId: this.applicationId,
      profile: this.profile,
      cachedConfigs: this.cache.size,
      lastRefreshAt: this.lastRefreshAt,
      autoRefresh: this.autoRefresh,
      refreshInterval: this.refreshInterval
    };
  }
}

/**
 * Demo function
 */
async function demonstrateExternalizedConfiguration() {
  console.log('=== Externalized Configuration Pattern Demo ===\n');

  // Create configuration server
  const configServer = new ConfigurationServer();

  // Set up configuration for different profiles
  console.log('Setting up configuration for different environments...\n');

  // Development profile
  configServer.set('my-app', 'database.url', 'localhost:5432', 'development');
  configServer.set('my-app', 'database.pool.size', 10, 'development');
  configServer.set('my-app', 'api.timeout', 5000, 'development');
  configServer.set('my-app', 'logging.level', 'DEBUG', 'development');

  // Production profile
  configServer.set('my-app', 'database.url', 'prod-db.example.com:5432', 'production');
  configServer.set('my-app', 'database.pool.size', 50, 'production');
  configServer.set('my-app', 'api.timeout', 10000, 'production');
  configServer.set('my-app', 'logging.level', 'ERROR', 'production');

  // Create configuration clients
  console.log('\nCreating configuration clients...\n');

  const devClient = new ConfigurationClient('my-app', configServer, {
    profile: 'development',
    autoRefresh: true,
    refreshInterval: 5000
  });

  const prodClient = new ConfigurationClient('my-app', configServer, {
    profile: 'production',
    autoRefresh: true,
    refreshInterval: 5000
  });

  await devClient.initialize();
  await prodClient.initialize();

  // Subscribe to configuration changes
  devClient.on('config-changed', (change) => {
    console.log(`[DEV] Configuration changed: ${change.key}`);
  });

  // Read configuration
  console.log('\n=== Reading Configuration ===\n');
  console.log('Development:');
  console.log(`  Database URL: ${devClient.get('database.url')}`);
  console.log(`  Pool Size: ${devClient.get('database.pool.size')}`);
  console.log(`  Logging Level: ${devClient.get('logging.level')}`);

  console.log('\nProduction:');
  console.log(`  Database URL: ${prodClient.get('database.url')}`);
  console.log(`  Pool Size: ${prodClient.get('database.pool.size')}`);
  console.log(`  Logging Level: ${prodClient.get('logging.level')}`);

  // Update configuration dynamically
  console.log('\n=== Updating Configuration Dynamically ===\n');
  configServer.set('my-app', 'database.pool.size', 20, 'development');
  configServer.set('my-app', 'logging.level', 'INFO', 'development');

  await delay(1000);

  // Cleanup
  devClient.shutdown();
  prodClient.shutdown();

  return { configServer, devClient, prodClient };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export components
module.exports = {
  ConfigEntry,
  ConfigurationServer,
  ConfigurationClient,
  demonstrateExternalizedConfiguration
};

// Run demo if executed directly
if (require.main === module) {
  demonstrateExternalizedConfiguration()
    .then(() => console.log('\n✅ Externalized Configuration demo completed'))
    .catch(error => console.error('❌ Error:', error));
}
