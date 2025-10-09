/**
 * Prototype Pattern - Production Implementation
 * Real object cloning with deep copy for complex data structures
 */

/**
 * Deep clone utility
 */
function deepClone(obj, cache = new WeakMap()) {
  // Handle primitives and null
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle circular references
  if (cache.has(obj)) {
    return cache.get(obj);
  }

  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  // Handle RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags);
  }

  // Handle Map
  if (obj instanceof Map) {
    const clonedMap = new Map();
    cache.set(obj, clonedMap);
    obj.forEach((value, key) => {
      clonedMap.set(deepClone(key, cache), deepClone(value, cache));
    });
    return clonedMap;
  }

  // Handle Set
  if (obj instanceof Set) {
    const clonedSet = new Set();
    cache.set(obj, clonedSet);
    obj.forEach(value => {
      clonedSet.add(deepClone(value, cache));
    });
    return clonedSet;
  }

  // Handle Array
  if (Array.isArray(obj)) {
    const clonedArray = [];
    cache.set(obj, clonedArray);
    obj.forEach((item, index) => {
      clonedArray[index] = deepClone(item, cache);
    });
    return clonedArray;
  }

  // Handle Object
  const clonedObj = Object.create(Object.getPrototypeOf(obj));
  cache.set(obj, clonedObj);

  Object.getOwnPropertyNames(obj).forEach(prop => {
    const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    if (descriptor.value !== undefined) {
      descriptor.value = deepClone(descriptor.value, cache);
    }
    Object.defineProperty(clonedObj, prop, descriptor);
  });

  return clonedObj;
}

/**
 * Prototype: Cloneable
 * Base interface for cloneable objects
 */
class Cloneable {
  clone() {
    throw new Error('Method clone() must be implemented');
  }
}

/**
 * Concrete Prototype: UserProfile
 * User profile with complex nested data
 */
class UserProfile extends Cloneable {
  constructor(data = {}) {
    super();
    this.id = data.id || null;
    this.username = data.username || '';
    this.email = data.email || '';
    this.profile = data.profile || {
      firstName: '',
      lastName: '',
      avatar: null,
      bio: '',
      socialLinks: []
    };
    this.settings = data.settings || {
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      privacy: {
        profileVisibility: 'public',
        showEmail: false,
        showPhone: false
      }
    };
    this.metadata = data.metadata || {
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      loginCount: 0
    };
    this.tags = data.tags || [];
    this.permissions = data.permissions || new Set();
  }

  clone() {
    return new UserProfile({
      id: this.id,
      username: this.username,
      email: this.email,
      profile: deepClone(this.profile),
      settings: deepClone(this.settings),
      metadata: deepClone(this.metadata),
      tags: [...this.tags],
      permissions: new Set(this.permissions)
    });
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      profile: this.profile,
      settings: this.settings,
      metadata: {
        ...this.metadata,
        createdAt: this.metadata.createdAt.toISOString(),
        updatedAt: this.metadata.updatedAt.toISOString(),
        lastLogin: this.metadata.lastLogin ? this.metadata.lastLogin.toISOString() : null
      },
      tags: this.tags,
      permissions: Array.from(this.permissions)
    };
  }
}

/**
 * Concrete Prototype: ApplicationState
 * Complex application state with nested structures
 */
class ApplicationState extends Cloneable {
  constructor(data = {}) {
    super();
    this.route = data.route || '/';
    this.user = data.user || null;
    this.ui = data.ui || {
      sidebar: { open: true, width: 250 },
      modals: [],
      notifications: [],
      theme: 'light'
    };
    this.data = data.data || {
      cache: new Map(),
      entities: {},
      loading: new Set(),
      errors: new Map()
    };
    this.history = data.history || [];
    this.timestamp = data.timestamp || Date.now();
  }

  clone() {
    return new ApplicationState({
      route: this.route,
      user: this.user ? deepClone(this.user) : null,
      ui: deepClone(this.ui),
      data: {
        cache: new Map(this.data.cache),
        entities: deepClone(this.data.entities),
        loading: new Set(this.data.loading),
        errors: new Map(this.data.errors)
      },
      history: [...this.history],
      timestamp: this.timestamp
    });
  }

  save() {
    const snapshot = this.clone();
    snapshot.timestamp = Date.now();
    return snapshot;
  }

  restore(snapshot) {
    this.route = snapshot.route;
    this.user = snapshot.user ? deepClone(snapshot.user) : null;
    this.ui = deepClone(snapshot.ui);
    this.data = deepClone(snapshot.data);
    this.history = [...snapshot.history];
    this.timestamp = snapshot.timestamp;
  }
}

/**
 * Concrete Prototype: Configuration
 * Application configuration object
 */
class Configuration extends Cloneable {
  constructor(data = {}) {
    super();
    this.environment = data.environment || 'development';
    this.server = data.server || {
      host: 'localhost',
      port: 3000,
      ssl: false
    };
    this.database = data.database || {
      host: 'localhost',
      port: 5432,
      name: 'myapp',
      pool: {
        min: 2,
        max: 10
      }
    };
    this.features = data.features || new Map();
    this.secrets = data.secrets || {};
    this.metadata = data.metadata || {
      version: '1.0.0',
      buildDate: new Date(),
      gitCommit: null
    };
  }

  clone() {
    return new Configuration({
      environment: this.environment,
      server: deepClone(this.server),
      database: deepClone(this.database),
      features: new Map(this.features),
      secrets: deepClone(this.secrets),
      metadata: deepClone(this.metadata)
    });
  }

  cloneForEnvironment(environment) {
    const cloned = this.clone();
    cloned.environment = environment;

    // Adjust settings based on environment
    if (environment === 'production') {
      cloned.server.ssl = true;
      cloned.database.pool.max = 50;
    } else if (environment === 'development') {
      cloned.server.ssl = false;
      cloned.database.pool.max = 5;
    }

    return cloned;
  }
}

/**
 * Concrete Prototype: APIRequest
 * Reusable API request template
 */
class APIRequest extends Cloneable {
  constructor(data = {}) {
    super();
    this.method = data.method || 'GET';
    this.url = data.url || '';
    this.headers = data.headers || {};
    this.params = data.params || {};
    this.body = data.body || null;
    this.timeout = data.timeout || 30000;
    this.retries = data.retries || 0;
    this.metadata = data.metadata || {
      createdAt: new Date(),
      requestCount: 0
    };
  }

  clone() {
    return new APIRequest({
      method: this.method,
      url: this.url,
      headers: deepClone(this.headers),
      params: deepClone(this.params),
      body: deepClone(this.body),
      timeout: this.timeout,
      retries: this.retries,
      metadata: deepClone(this.metadata)
    });
  }

  cloneWithParams(params) {
    const cloned = this.clone();
    cloned.params = { ...cloned.params, ...params };
    cloned.metadata.requestCount++;
    return cloned;
  }

  cloneWithBody(body) {
    const cloned = this.clone();
    cloned.body = deepClone(body);
    cloned.metadata.requestCount++;
    return cloned;
  }
}

/**
 * PrototypeRegistry
 * Manages a catalog of prototype instances
 */
class PrototypeRegistry {
  constructor() {
    this.prototypes = new Map();
  }

  register(key, prototype) {
    if (!(prototype instanceof Cloneable)) {
      throw new Error('Prototype must implement Cloneable interface');
    }
    this.prototypes.set(key, prototype);
  }

  unregister(key) {
    return this.prototypes.delete(key);
  }

  clone(key) {
    const prototype = this.prototypes.get(key);
    if (!prototype) {
      throw new Error(`Prototype not found: ${key}`);
    }
    return prototype.clone();
  }

  has(key) {
    return this.prototypes.has(key);
  }

  list() {
    return Array.from(this.prototypes.keys());
  }

  clear() {
    this.prototypes.clear();
  }
}

/**
 * StateManager
 * Manages state snapshots using prototype pattern
 */
class StateManager {
  constructor(initialState) {
    this.currentState = initialState;
    this.history = [];
    this.maxHistorySize = 50;
  }

  save() {
    const snapshot = this.currentState.clone();
    this.history.push(snapshot);

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    return snapshot;
  }

  undo() {
    if (this.history.length === 0) {
      throw new Error('No history to undo');
    }

    const snapshot = this.history.pop();
    this.currentState = snapshot.clone();
    return this.currentState;
  }

  getState() {
    return this.currentState;
  }

  setState(state) {
    this.currentState = state;
  }

  getHistorySize() {
    return this.history.length;
  }

  clearHistory() {
    this.history = [];
  }
}

/**
 * ObjectPool
 * Reuses cloned objects for better performance
 */
class ObjectPool {
  constructor(prototype, initialSize = 10) {
    this.prototype = prototype;
    this.available = [];
    this.inUse = new Set();

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.available.push(prototype.clone());
    }
  }

  acquire() {
    let obj;

    if (this.available.length > 0) {
      obj = this.available.pop();
    } else {
      obj = this.prototype.clone();
    }

    this.inUse.add(obj);
    return obj;
  }

  release(obj) {
    if (this.inUse.has(obj)) {
      this.inUse.delete(obj);
      this.available.push(obj);
      return true;
    }
    return false;
  }

  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size
    };
  }
}

module.exports = {
  Cloneable,
  UserProfile,
  ApplicationState,
  Configuration,
  APIRequest,
  PrototypeRegistry,
  StateManager,
  ObjectPool,
  deepClone
};
