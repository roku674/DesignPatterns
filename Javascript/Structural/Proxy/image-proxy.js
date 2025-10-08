/**
 * Proxy Pattern - Image Loading and Caching Example
 *
 * The Proxy pattern provides a substitute or placeholder for another object.
 * A proxy controls access to the original object, allowing you to perform
 * something either before or after the request gets to the original object.
 */

// ============= Subject Interface =============

/**
 * Image Interface
 */
class Image {
  display() {
    throw new Error('Method display() must be implemented');
  }

  getInfo() {
    throw new Error('Method getInfo() must be implemented');
  }
}

// ============= Real Subject =============

/**
 * RealImage - The actual object that does the real work
 * Expensive to create (simulates loading from disk/network)
 */
class RealImage extends Image {
  constructor(filename) {
    super();
    this.filename = filename;
    this.loadTime = null;
    this.loadFromDisk();
  }

  loadFromDisk() {
    const startTime = Date.now();
    console.log(`[RealImage] Loading ${this.filename} from disk...`);

    // Simulate expensive loading operation
    const sleep = (ms) => {
      const start = Date.now();
      while (Date.now() - start < ms) {}
    };
    sleep(100); // Simulate 100ms load time

    this.loadTime = Date.now() - startTime;
    console.log(`[RealImage] ${this.filename} loaded in ${this.loadTime}ms`);
  }

  display() {
    console.log(`[RealImage] Displaying ${this.filename}`);
  }

  getInfo() {
    return {
      filename: this.filename,
      type: 'RealImage',
      loaded: true,
      loadTime: this.loadTime
    };
  }
}

// ============= Proxies =============

/**
 * VirtualProxy - Lazy loading
 * Delays creation of expensive object until it's actually needed
 */
class ImageProxy extends Image {
  constructor(filename) {
    super();
    this.filename = filename;
    this.realImage = null;
  }

  display() {
    if (this.realImage === null) {
      console.log('[Proxy] First access - creating real image...');
      this.realImage = new RealImage(this.filename);
    } else {
      console.log('[Proxy] Using cached image...');
    }

    this.realImage.display();
  }

  getInfo() {
    if (this.realImage === null) {
      return {
        filename: this.filename,
        type: 'Proxy',
        loaded: false,
        loadTime: null
      };
    }

    return this.realImage.getInfo();
  }
}

/**
 * ProtectionProxy - Access control
 * Checks permissions before allowing access to real object
 */
class ProtectedImageProxy extends Image {
  constructor(filename, requiredRole) {
    super();
    this.filename = filename;
    this.requiredRole = requiredRole;
    this.realImage = null;
  }

  checkAccess(userRole) {
    const roles = ['guest', 'user', 'admin'];
    const userLevel = roles.indexOf(userRole);
    const requiredLevel = roles.indexOf(this.requiredRole);

    return userLevel >= requiredLevel;
  }

  display(userRole = 'guest') {
    if (!this.checkAccess(userRole)) {
      console.log(`[ProtectedProxy] Access denied! Requires '${this.requiredRole}' role, you are '${userRole}'`);
      return;
    }

    console.log(`[ProtectedProxy] Access granted for ${userRole}`);

    if (this.realImage === null) {
      this.realImage = new RealImage(this.filename);
    }

    this.realImage.display();
  }

  getInfo(userRole = 'guest') {
    if (!this.checkAccess(userRole)) {
      return {
        filename: this.filename,
        type: 'ProtectedProxy',
        error: 'Access Denied',
        requiredRole: this.requiredRole
      };
    }

    if (this.realImage === null) {
      this.realImage = new RealImage(this.filename);
    }

    return this.realImage.getInfo();
  }
}

/**
 * CachingProxy - Caching
 * Caches results to avoid repeated expensive operations
 */
class CachingImageProxy extends Image {
  constructor(filename) {
    super();
    this.filename = filename;
    this.realImage = new RealImage(filename);
    this.displayCache = new Map();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  display(options = {}) {
    const cacheKey = JSON.stringify(options);

    if (this.displayCache.has(cacheKey)) {
      this.cacheHits++;
      console.log(`[CachingProxy] Cache HIT (${this.cacheHits} hits) - Returning cached result`);
      console.log(this.displayCache.get(cacheKey));
    } else {
      this.cacheMisses++;
      console.log(`[CachingProxy] Cache MISS (${this.cacheMisses} misses) - Computing result`);
      this.realImage.display();

      // Simulate some processing and cache the result
      const result = `Processed display of ${this.filename} with options: ${cacheKey}`;
      this.displayCache.set(cacheKey, result);
      console.log(result);
    }
  }

  getInfo() {
    const info = this.realImage.getInfo();
    info.cacheStats = {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: this.cacheHits + this.cacheMisses > 0
        ? ((this.cacheHits / (this.cacheHits + this.cacheMisses)) * 100).toFixed(2) + '%'
        : '0%'
    };
    return info;
  }
}

/**
 * LoggingProxy - Logging
 * Logs all accesses to the real object
 */
class LoggingImageProxy extends Image {
  constructor(filename) {
    super();
    this.filename = filename;
    this.realImage = new RealImage(filename);
    this.accessLog = [];
  }

  display() {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: 'display',
      filename: this.filename
    };

    this.accessLog.push(logEntry);
    console.log(`[LoggingProxy] Logged access #${this.accessLog.length} at ${logEntry.timestamp}`);

    this.realImage.display();
  }

  getInfo() {
    return {
      ...this.realImage.getInfo(),
      totalAccesses: this.accessLog.length,
      accessLog: this.accessLog
    };
  }

  getAccessLog() {
    return this.accessLog;
  }
}

module.exports = {
  RealImage,
  ImageProxy,
  ProtectedImageProxy,
  CachingImageProxy,
  LoggingImageProxy
};
