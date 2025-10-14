/**
 * Self-Contained Service Pattern
 *
 * A microservice that contains all the necessary components to function independently,
 * including its own database, business logic, and APIs. It does not share databases
 * or code with other services, ensuring loose coupling and independent deployment.
 *
 * Key Components:
 * - Private Database: Service-specific data storage
 * - Business Logic: Domain operations encapsulated within the service
 * - API Layer: Exposed endpoints for external communication
 * - Internal State: Service manages its own state
 * - Dependencies: Minimal external dependencies
 * - Self-Sufficiency: Can operate independently
 */

const EventEmitter = require('events');

/**
 * In-Memory Database for Self-Contained Service
 */
class ServiceDatabase {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.collections = new Map();
    this.indexes = new Map();
    this.transactionLog = [];
  }

  /**
   * Create collection
   */
  createCollection(name, schema = {}) {
    if (!this.collections.has(name)) {
      this.collections.set(name, {
        name,
        schema,
        data: new Map(),
        nextId: 1
      });
      console.log(`[${this.serviceName}] Collection created: ${name}`);
    }
  }

  /**
   * Insert document
   */
  insert(collectionName, document) {
    const collection = this.collections.get(collectionName);
    if (!collection) {
      throw new Error(`Collection ${collectionName} does not exist`);
    }

    const id = document.id || `${collectionName}-${collection.nextId++}`;
    const doc = { ...document, id, createdAt: new Date().toISOString() };

    collection.data.set(id, doc);

    this.transactionLog.push({
      operation: 'INSERT',
      collection: collectionName,
      id,
      timestamp: new Date().toISOString()
    });

    return doc;
  }

  /**
   * Find document by ID
   */
  findById(collectionName, id) {
    const collection = this.collections.get(collectionName);
    if (!collection) {
      throw new Error(`Collection ${collectionName} does not exist`);
    }

    return collection.data.get(id);
  }

  /**
   * Find documents by query
   */
  find(collectionName, query = {}) {
    const collection = this.collections.get(collectionName);
    if (!collection) {
      throw new Error(`Collection ${collectionName} does not exist`);
    }

    const results = [];
    for (const doc of collection.data.values()) {
      if (this.matchesQuery(doc, query)) {
        results.push(doc);
      }
    }

    return results;
  }

  matchesQuery(doc, query) {
    for (const [key, value] of Object.entries(query)) {
      if (doc[key] !== value) {
        return false;
      }
    }
    return true;
  }

  /**
   * Update document
   */
  update(collectionName, id, updates) {
    const collection = this.collections.get(collectionName);
    if (!collection) {
      throw new Error(`Collection ${collectionName} does not exist`);
    }

    const doc = collection.data.get(id);
    if (!doc) {
      throw new Error(`Document ${id} not found in ${collectionName}`);
    }

    const updated = { ...doc, ...updates, updatedAt: new Date().toISOString() };
    collection.data.set(id, updated);

    this.transactionLog.push({
      operation: 'UPDATE',
      collection: collectionName,
      id,
      timestamp: new Date().toISOString()
    });

    return updated;
  }

  /**
   * Delete document
   */
  delete(collectionName, id) {
    const collection = this.collections.get(collectionName);
    if (!collection) {
      throw new Error(`Collection ${collectionName} does not exist`);
    }

    const deleted = collection.data.delete(id);

    if (deleted) {
      this.transactionLog.push({
        operation: 'DELETE',
        collection: collectionName,
        id,
        timestamp: new Date().toISOString()
      });
    }

    return deleted;
  }

  /**
   * Get collection statistics
   */
  getStats() {
    const stats = {
      collections: this.collections.size,
      totalDocuments: 0,
      transactionCount: this.transactionLog.length
    };

    for (const collection of this.collections.values()) {
      stats.totalDocuments += collection.data.size;
      stats[collection.name] = collection.data.size;
    }

    return stats;
  }
}

/**
 * Business Logic Layer
 */
class BusinessLogic {
  constructor(database) {
    this.database = database;
  }

  /**
   * Validate data before operations
   */
  validate(data, rules) {
    for (const [field, rule] of Object.entries(rules)) {
      if (rule.required && !data[field]) {
        throw new Error(`Field '${field}' is required`);
      }

      if (rule.type && typeof data[field] !== rule.type) {
        throw new Error(`Field '${field}' must be of type ${rule.type}`);
      }

      if (rule.min && data[field] < rule.min) {
        throw new Error(`Field '${field}' must be at least ${rule.min}`);
      }

      if (rule.max && data[field] > rule.max) {
        throw new Error(`Field '${field}' must be at most ${rule.max}`);
      }

      if (rule.pattern && !rule.pattern.test(data[field])) {
        throw new Error(`Field '${field}' does not match required pattern`);
      }
    }

    return true;
  }

  /**
   * Execute business rules
   */
  async executeBusinessRules(context, rules) {
    for (const rule of rules) {
      if (!await rule(context)) {
        return false;
      }
    }
    return true;
  }
}

/**
 * API Layer
 */
class APILayer extends EventEmitter {
  constructor(serviceName) {
    super();
    this.serviceName = serviceName;
    this.routes = new Map();
    this.middleware = [];
    this.requestCount = 0;
  }

  /**
   * Register middleware
   */
  use(fn) {
    this.middleware.push(fn);
  }

  /**
   * Register route handler
   */
  register(method, path, handler) {
    const key = `${method}:${path}`;
    this.routes.set(key, handler);
    console.log(`[${this.serviceName}] Route registered: ${method} ${path}`);
  }

  /**
   * Handle HTTP-like request
   */
  async handleRequest(method, path, body = null, params = {}) {
    this.requestCount++;

    const request = {
      method,
      path,
      body,
      params,
      timestamp: new Date().toISOString(),
      requestId: `req-${this.requestCount}`
    };

    const response = {
      status: 200,
      body: null,
      headers: {}
    };

    try {
      // Execute middleware
      for (const fn of this.middleware) {
        await fn(request, response);
      }

      // Find and execute route handler
      const key = `${method}:${path}`;
      const handler = this.routes.get(key);

      if (!handler) {
        response.status = 404;
        response.body = { error: 'Not Found' };
        return response;
      }

      const result = await handler(request, response);
      if (result !== undefined) {
        response.body = result;
      }
    } catch (error) {
      response.status = 500;
      response.body = { error: error.message };
      console.error(`[${this.serviceName}] Request error:`, error);
    }

    this.emit('request-completed', request, response);
    return response;
  }

  /**
   * Get API statistics
   */
  getStats() {
    return {
      serviceName: this.serviceName,
      requestCount: this.requestCount,
      routeCount: this.routes.size,
      middlewareCount: this.middleware.length
    };
  }
}

/**
 * Self-Contained Service
 */
class SelfContainedService extends EventEmitter {
  constructor(serviceName, options = {}) {
    super();
    this.serviceName = serviceName;
    this.version = options.version || '1.0.0';

    // Core components
    this.database = new ServiceDatabase(serviceName);
    this.businessLogic = new BusinessLogic(this.database);
    this.api = new APILayer(serviceName);

    // Service state
    this.state = 'created'; // created, running, stopped
    this.startedAt = null;

    // Setup logging
    this.setupLogging();
  }

  setupLogging() {
    this.api.on('request-completed', (request, response) => {
      console.log(
        `[${this.serviceName}] ${request.method} ${request.path} - ${response.status}`
      );
    });
  }

  /**
   * Initialize database schema
   */
  initializeDatabase(schema) {
    for (const [collectionName, collectionSchema] of Object.entries(schema)) {
      this.database.createCollection(collectionName, collectionSchema);
    }
  }

  /**
   * Register API endpoints
   */
  registerEndpoints(endpoints) {
    for (const endpoint of endpoints) {
      this.api.register(endpoint.method, endpoint.path, endpoint.handler);
    }
  }

  /**
   * Start service
   */
  async start() {
    if (this.state !== 'created') {
      throw new Error(`Cannot start service in state: ${this.state}`);
    }

    this.state = 'running';
    this.startedAt = new Date().toISOString();

    console.log(`[${this.serviceName}] Service started (v${this.version})`);
    this.emit('started');
  }

  /**
   * Stop service
   */
  async stop() {
    if (this.state !== 'running') {
      return;
    }

    this.state = 'stopped';
    console.log(`[${this.serviceName}] Service stopped`);
    this.emit('stopped');
  }

  /**
   * Get service health
   */
  getHealth() {
    return {
      service: this.serviceName,
      version: this.version,
      state: this.state,
      startedAt: this.startedAt,
      uptime: this.startedAt ? Date.now() - new Date(this.startedAt).getTime() : 0,
      database: this.database.getStats(),
      api: this.api.getStats()
    };
  }
}

/**
 * Example: Product Catalog Service (Self-Contained)
 */
class ProductCatalogService extends SelfContainedService {
  constructor() {
    super('product-catalog-service', { version: '1.0.0' });

    // Initialize database
    this.initializeDatabase({
      products: {
        id: 'string',
        name: 'string',
        description: 'string',
        price: 'number',
        category: 'string',
        stock: 'number'
      },
      categories: {
        id: 'string',
        name: 'string',
        description: 'string'
      }
    });

    // Register API endpoints
    this.registerEndpoints([
      {
        method: 'POST',
        path: '/products',
        handler: this.createProduct.bind(this)
      },
      {
        method: 'GET',
        path: '/products/:id',
        handler: this.getProduct.bind(this)
      },
      {
        method: 'GET',
        path: '/products',
        handler: this.listProducts.bind(this)
      },
      {
        method: 'PUT',
        path: '/products/:id',
        handler: this.updateProduct.bind(this)
      },
      {
        method: 'DELETE',
        path: '/products/:id',
        handler: this.deleteProduct.bind(this)
      },
      {
        method: 'POST',
        path: '/categories',
        handler: this.createCategory.bind(this)
      }
    ]);

    // Add validation middleware
    this.api.use(async (request, response) => {
      console.log(`[${this.serviceName}] Processing ${request.method} ${request.path}`);
    });
  }

  async createProduct(request) {
    const { name, description, price, category, stock } = request.body;

    // Validate input
    this.businessLogic.validate(request.body, {
      name: { required: true, type: 'string' },
      price: { required: true, type: 'number', min: 0 },
      stock: { required: true, type: 'number', min: 0 }
    });

    // Business logic: Check if category exists
    if (category) {
      const categoryDoc = this.database.find('categories', { name: category });
      if (categoryDoc.length === 0) {
        throw new Error(`Category '${category}' does not exist`);
      }
    }

    // Create product
    const product = this.database.insert('products', {
      name,
      description,
      price,
      category,
      stock
    });

    return { success: true, product };
  }

  async getProduct(request) {
    const productId = request.path.split('/').pop();
    const product = this.database.findById('products', productId);

    if (!product) {
      throw new Error('Product not found');
    }

    return { success: true, product };
  }

  async listProducts(request) {
    const query = request.params.category ? { category: request.params.category } : {};
    const products = this.database.find('products', query);

    return {
      success: true,
      products,
      count: products.length
    };
  }

  async updateProduct(request) {
    const productId = request.path.split('/').pop();
    const updates = request.body;

    // Validate updates
    if (updates.price !== undefined) {
      this.businessLogic.validate(updates, {
        price: { type: 'number', min: 0 }
      });
    }

    const product = this.database.update('products', productId, updates);

    return { success: true, product };
  }

  async deleteProduct(request) {
    const productId = request.path.split('/').pop();

    // Business logic: Check if product can be deleted
    const product = this.database.findById('products', productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock > 0) {
      throw new Error('Cannot delete product with stock');
    }

    this.database.delete('products', productId);

    return { success: true, message: 'Product deleted' };
  }

  async createCategory(request) {
    const { name, description } = request.body;

    this.businessLogic.validate(request.body, {
      name: { required: true, type: 'string' }
    });

    const category = this.database.insert('categories', { name, description });

    return { success: true, category };
  }
}

/**
 * Demo function
 */
async function demonstrateSelfContainedService() {
  console.log('=== Self-Contained Service Pattern Demo ===\n');

  // Create self-contained product catalog service
  const productService = new ProductCatalogService();

  // Start service
  await productService.start();

  // Create categories
  console.log('\n=== Creating Categories ===\n');
  await productService.api.handleRequest('POST', '/categories', {
    name: 'Electronics',
    description: 'Electronic devices and accessories'
  });

  await productService.api.handleRequest('POST', '/categories', {
    name: 'Books',
    description: 'Books and publications'
  });

  // Create products
  console.log('\n=== Creating Products ===\n');
  await productService.api.handleRequest('POST', '/products', {
    name: 'Laptop',
    description: 'High-performance laptop',
    price: 1200,
    category: 'Electronics',
    stock: 10
  });

  await productService.api.handleRequest('POST', '/products', {
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse',
    price: 25,
    category: 'Electronics',
    stock: 50
  });

  await productService.api.handleRequest('POST', '/products', {
    name: 'JavaScript Guide',
    description: 'Comprehensive JavaScript guide',
    price: 45,
    category: 'Books',
    stock: 30
  });

  // List products
  console.log('\n=== Listing Products ===\n');
  const listResponse = await productService.api.handleRequest('GET', '/products');
  console.log(`Found ${listResponse.body.count} products`);

  // Get specific product
  console.log('\n=== Getting Specific Product ===\n');
  const product = listResponse.body.products[0];
  const getResponse = await productService.api.handleRequest('GET', `/products/${product.id}`);
  console.log('Product:', getResponse.body.product);

  // Update product
  console.log('\n=== Updating Product ===\n');
  await productService.api.handleRequest('PUT', `/products/${product.id}`, {
    price: 1100,
    stock: 8
  });

  // Test validation
  console.log('\n=== Testing Validation ===\n');
  try {
    await productService.api.handleRequest('POST', '/products', {
      name: 'Invalid Product',
      price: -10, // Invalid price
      stock: 5
    });
  } catch (error) {
    console.log('Validation error caught:', error.message);
  }

  // Service health check
  console.log('\n=== Service Health ===\n');
  const health = productService.getHealth();
  console.log(JSON.stringify(health, null, 2));

  // Stop service
  await productService.stop();

  return productService;
}

// Export components
module.exports = {
  ServiceDatabase,
  BusinessLogic,
  APILayer,
  SelfContainedService,
  ProductCatalogService,
  demonstrateSelfContainedService
};

// Run demo if executed directly
if (require.main === module) {
  demonstrateSelfContainedService()
    .then(() => console.log('\n✅ Self-Contained Service demo completed'))
    .catch(error => console.error('❌ Error:', error));
}
