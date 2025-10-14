/**
 * Static Content Hosting Pattern
 *
 * Delivers static assets directly from cloud storage or CDN, offloading
 * web servers and improving performance and scalability.
 *
 * Use Cases:
 * - Hosting images, CSS, JavaScript files
 * - CDN integration for global content delivery
 * - Single-page application hosting
 * - API documentation and static sites
 * - Reducing server load for static assets
 */

const EventEmitter = require('events');
const crypto = require('crypto');
const path = require('path');

/**
 * Content Storage Manager
 */
class ContentStorage {
  constructor(config = {}) {
    this.storage = new Map();
    this.baseUrl = config.baseUrl || 'https://cdn.example.com';
    this.basePath = config.basePath || '/static';
  }

  async store(filePath, content, metadata = {}) {
    const key = this.normalizeKey(filePath);
    const hash = crypto.createHash('md5').update(content).digest('hex');

    const entry = {
      content,
      contentType: metadata.contentType || this.guessContentType(filePath),
      size: Buffer.byteLength(content),
      hash,
      lastModified: Date.now(),
      metadata
    };

    this.storage.set(key, entry);

    return {
      key,
      url: this.getPublicUrl(key),
      hash,
      size: entry.size
    };
  }

  async retrieve(filePath) {
    const key = this.normalizeKey(filePath);
    const entry = this.storage.get(key);

    if (!entry) {
      throw new Error(`File not found: ${filePath}`);
    }

    return entry;
  }

  async delete(filePath) {
    const key = this.normalizeKey(filePath);
    const deleted = this.storage.delete(key);

    if (!deleted) {
      throw new Error(`File not found: ${filePath}`);
    }

    return { success: true };
  }

  async list(prefix = '') {
    const normalizedPrefix = this.normalizeKey(prefix);
    const files = [];

    for (const [key, entry] of this.storage.entries()) {
      if (key.startsWith(normalizedPrefix)) {
        files.push({
          key,
          url: this.getPublicUrl(key),
          size: entry.size,
          contentType: entry.contentType,
          lastModified: entry.lastModified,
          hash: entry.hash
        });
      }
    }

    return files;
  }

  normalizeKey(filePath) {
    return filePath.replace(/^\/+|\/+$/g, '');
  }

  getPublicUrl(key) {
    return `${this.baseUrl}${this.basePath}/${key}`;
  }

  guessContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain'
    };

    return types[ext] || 'application/octet-stream';
  }
}

/**
 * CDN Integration
 */
class CDNManager {
  constructor(config = {}) {
    this.enabled = config.enabled !== false;
    this.endpoints = config.endpoints || [];
    this.cacheControl = config.cacheControl || 'public, max-age=31536000';
    this.distributions = new Map();
  }

  addDistribution(name, endpoint) {
    this.distributions.set(name, {
      endpoint,
      enabled: true,
      stats: {
        requests: 0,
        hits: 0,
        misses: 0
      }
    });
  }

  getCdnUrl(key, distributionName = 'default') {
    const distribution = this.distributions.get(distributionName);

    if (!distribution || !distribution.enabled) {
      return null;
    }

    return `${distribution.endpoint}/${key}`;
  }

  recordRequest(distributionName, hit) {
    const distribution = this.distributions.get(distributionName);

    if (!distribution) {
      return;
    }

    distribution.stats.requests++;

    if (hit) {
      distribution.stats.hits++;
    } else {
      distribution.stats.misses++;
    }
  }

  getStats(distributionName) {
    const distribution = this.distributions.get(distributionName);

    if (!distribution) {
      return null;
    }

    return {
      ...distribution.stats,
      hitRate: distribution.stats.requests > 0
        ? ((distribution.stats.hits / distribution.stats.requests) * 100).toFixed(2) + '%'
        : '0%'
    };
  }

  getAllStats() {
    const stats = {};

    for (const [name, distribution] of this.distributions.entries()) {
      stats[name] = this.getStats(name);
    }

    return stats;
  }
}

/**
 * Cache Manager
 */
class CacheManager {
  constructor(config = {}) {
    this.cache = new Map();
    this.maxSize = config.maxSize || 100 * 1024 * 1024;
    this.currentSize = 0;
    this.ttl = config.ttl || 3600000;
  }

  set(key, content, size) {
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      this.evictOldest();
    }

    this.cache.set(key, {
      content,
      size,
      cachedAt: Date.now(),
      expiresAt: Date.now() + this.ttl,
      hits: 0
    });

    this.currentSize += size;
  }

  get(key) {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    entry.hits++;
    return entry.content;
  }

  delete(key) {
    const entry = this.cache.get(key);

    if (entry) {
      this.currentSize -= entry.size;
      this.cache.delete(key);
    }
  }

  evictOldest() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.cachedAt < oldestTime) {
        oldestTime = entry.cachedAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  clear() {
    this.cache.clear();
    this.currentSize = 0;
  }

  getStats() {
    return {
      entries: this.cache.size,
      currentSize: this.currentSize,
      maxSize: this.maxSize,
      utilization: ((this.currentSize / this.maxSize) * 100).toFixed(2) + '%'
    };
  }
}

/**
 * Access Control Manager
 */
class AccessControl {
  constructor(config = {}) {
    this.rules = new Map();
    this.defaultAccess = config.defaultAccess || 'public';
  }

  setRule(pattern, access) {
    this.rules.set(pattern, access);
  }

  checkAccess(filePath, user = null) {
    for (const [pattern, access] of this.rules.entries()) {
      if (this.matchesPattern(filePath, pattern)) {
        if (access === 'public') {
          return { allowed: true };
        }

        if (access === 'authenticated' && user) {
          return { allowed: true };
        }

        if (access === 'private') {
          return { allowed: false, reason: 'Access denied' };
        }
      }
    }

    return { allowed: this.defaultAccess === 'public' };
  }

  matchesPattern(filePath, pattern) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return regex.test(filePath);
  }
}

/**
 * Main Static Content Hosting implementation
 */
class StaticContentHosting extends EventEmitter {
  constructor(config = {}) {
    super();
    this.storage = new ContentStorage(config.storage || {});
    this.cdn = new CDNManager(config.cdn || {});
    this.cache = new CacheManager(config.cache || {});
    this.accessControl = new AccessControl(config.accessControl || {});
    this.metrics = {
      uploads: 0,
      downloads: 0,
      cacheHits: 0,
      cacheMisses: 0,
      bytesServed: 0
    };
  }

  async upload(filePath, content, options = {}) {
    try {
      this.emit('upload:start', { filePath });

      const result = await this.storage.store(filePath, content, options);

      this.metrics.uploads++;

      this.emit('upload:complete', { filePath, url: result.url });

      return result;
    } catch (error) {
      this.emit('upload:error', { filePath, error: error.message });
      throw error;
    }
  }

  async download(filePath, user = null) {
    try {
      const accessCheck = this.accessControl.checkAccess(filePath, user);

      if (!accessCheck.allowed) {
        throw new Error(accessCheck.reason || 'Access denied');
      }

      const cached = this.cache.get(filePath);

      if (cached) {
        this.metrics.cacheHits++;
        this.metrics.downloads++;
        this.metrics.bytesServed += Buffer.byteLength(cached);

        this.emit('download:cache-hit', { filePath });

        return {
          content: cached,
          source: 'cache'
        };
      }

      this.metrics.cacheMisses++;

      const entry = await this.storage.retrieve(filePath);

      this.cache.set(filePath, entry.content, entry.size);

      this.metrics.downloads++;
      this.metrics.bytesServed += entry.size;

      this.emit('download:complete', { filePath, size: entry.size });

      return {
        content: entry.content,
        contentType: entry.contentType,
        size: entry.size,
        lastModified: entry.lastModified,
        hash: entry.hash,
        source: 'storage'
      };
    } catch (error) {
      this.emit('download:error', { filePath, error: error.message });
      throw error;
    }
  }

  async delete(filePath) {
    await this.storage.delete(filePath);
    this.cache.delete(filePath);

    this.emit('delete:complete', { filePath });

    return { success: true };
  }

  async list(prefix = '') {
    return await this.storage.list(prefix);
  }

  getPublicUrl(filePath, useCdn = true, distributionName = 'default') {
    if (useCdn) {
      const cdnUrl = this.cdn.getCdnUrl(filePath, distributionName);
      if (cdnUrl) {
        return cdnUrl;
      }
    }

    return this.storage.getPublicUrl(filePath);
  }

  setAccessRule(pattern, access) {
    this.accessControl.setRule(pattern, access);
  }

  getMetrics() {
    return {
      ...this.metrics,
      cacheHitRate: (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
        ? ((this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)) * 100).toFixed(2) + '%'
        : '0%',
      cache: this.cache.getStats(),
      cdn: this.cdn.getAllStats()
    };
  }

  clearCache() {
    this.cache.clear();
    this.emit('cache:cleared');
  }
}

/**
 * Example usage and demonstration
 */
function demonstrateStaticContentHosting() {
  console.log('=== Static Content Hosting Pattern Demo ===\n');

  const hosting = new StaticContentHosting({
    storage: {
      baseUrl: 'https://cdn.example.com',
      basePath: '/static'
    },
    cdn: {
      enabled: true
    },
    cache: {
      maxSize: 10 * 1024 * 1024,
      ttl: 3600000
    }
  });

  hosting.cdn.addDistribution('default', 'https://d123456.cloudfront.net');

  hosting.setAccessRule('*.html', 'public');
  hosting.setAccessRule('admin/*', 'private');

  hosting.on('upload:complete', ({ filePath, url }) => {
    console.log(`Uploaded: ${filePath} -> ${url}`);
  });

  hosting.on('download:cache-hit', ({ filePath }) => {
    console.log(`Cache hit: ${filePath}`);
  });

  Promise.all([
    hosting.upload('index.html', '<html><body>Hello World</body></html>', {
      contentType: 'text/html'
    }),
    hosting.upload('styles.css', 'body { margin: 0; }', {
      contentType: 'text/css'
    }),
    hosting.upload('app.js', 'console.log("Hello");', {
      contentType: 'application/javascript'
    })
  ]).then(() => {
    console.log('\n3 files uploaded successfully');

    return hosting.download('index.html');
  }).then(result => {
    console.log(`\nDownloaded index.html (${result.source})`);
    console.log(`Content: ${result.content.substring(0, 50)}...`);

    return hosting.download('index.html');
  }).then(result => {
    console.log(`\nDownloaded index.html again (${result.source})`);

    return hosting.list();
  }).then(files => {
    console.log(`\nListed ${files.length} files:`);
    files.forEach(file => {
      console.log(`  - ${file.key} (${file.size} bytes)`);
    });

    console.log('\nMetrics:');
    console.log(JSON.stringify(hosting.getMetrics(), null, 2));
  }).catch(error => {
    console.error('Error:', error.message);
  });
}

if (require.main === module) {
  demonstrateStaticContentHosting();
}

module.exports = StaticContentHosting;
