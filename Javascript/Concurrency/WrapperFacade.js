/**
 * Wrapper Facade Pattern
 *
 * Purpose:
 * Encapsulates low-level system APIs behind a higher-level, easier-to-use
 * interface. Particularly useful for async operations and complex APIs.
 *
 * Use Cases:
 * - Simplifying file system operations
 * - Wrapping database drivers
 * - HTTP client abstractions
 * - WebSocket management
 *
 * @author Design Patterns Implementation
 * @date 2025
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');

/**
 * File System Wrapper Facade
 * Simplifies Node.js file system operations
 */
class FileSystemFacade {
  constructor(options = {}) {
    this.baseDir = options.baseDir || process.cwd();
    this.encoding = options.encoding || 'utf8';
    this.createDirIfNotExists = options.createDirIfNotExists !== false;
  }

  /**
   * Read file with automatic error handling
   */
  async readFile(filePath) {
    try {
      const fullPath = this.resolvePath(filePath);
      const content = await fs.readFile(fullPath, this.encoding);
      return { success: true, content, path: fullPath };
    } catch (error) {
      return { success: false, error: error.message, path: filePath };
    }
  }

  /**
   * Write file with automatic directory creation
   */
  async writeFile(filePath, content) {
    try {
      const fullPath = this.resolvePath(filePath);

      if (this.createDirIfNotExists) {
        const dir = path.dirname(fullPath);
        await this.ensureDir(dir);
      }

      await fs.writeFile(fullPath, content, this.encoding);
      return { success: true, path: fullPath, bytes: content.length };
    } catch (error) {
      return { success: false, error: error.message, path: filePath };
    }
  }

  /**
   * Append to file
   */
  async appendFile(filePath, content) {
    try {
      const fullPath = this.resolvePath(filePath);
      await fs.appendFile(fullPath, content, this.encoding);
      return { success: true, path: fullPath };
    } catch (error) {
      return { success: false, error: error.message, path: filePath };
    }
  }

  /**
   * Check if file exists
   */
  async exists(filePath) {
    try {
      const fullPath = this.resolvePath(filePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(filePath) {
    try {
      const fullPath = this.resolvePath(filePath);
      await fs.unlink(fullPath);
      return { success: true, path: fullPath };
    } catch (error) {
      return { success: false, error: error.message, path: filePath };
    }
  }

  /**
   * List directory contents
   */
  async listDirectory(dirPath) {
    try {
      const fullPath = this.resolvePath(dirPath);
      const entries = await fs.readdir(fullPath, { withFileTypes: true });

      const items = entries.map(entry => ({
        name: entry.name,
        path: path.join(fullPath, entry.name),
        isDirectory: entry.isDirectory(),
        isFile: entry.isFile()
      }));

      return { success: true, items, path: fullPath };
    } catch (error) {
      return { success: false, error: error.message, path: dirPath };
    }
  }

  /**
   * Create directory
   */
  async createDirectory(dirPath) {
    try {
      const fullPath = this.resolvePath(dirPath);
      await fs.mkdir(fullPath, { recursive: true });
      return { success: true, path: fullPath };
    } catch (error) {
      return { success: false, error: error.message, path: dirPath };
    }
  }

  /**
   * Copy file
   */
  async copyFile(sourcePath, destPath) {
    try {
      const fullSource = this.resolvePath(sourcePath);
      const fullDest = this.resolvePath(destPath);

      await fs.copyFile(fullSource, fullDest);
      return { success: true, source: fullSource, dest: fullDest };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get file stats
   */
  async getStats(filePath) {
    try {
      const fullPath = this.resolvePath(filePath);
      const stats = await fs.stat(fullPath);

      return {
        success: true,
        path: fullPath,
        size: stats.size,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      };
    } catch (error) {
      return { success: false, error: error.message, path: filePath };
    }
  }

  /**
   * Helper: Resolve path
   */
  resolvePath(filePath) {
    return path.isAbsolute(filePath) ? filePath : path.join(this.baseDir, filePath);
  }

  /**
   * Helper: Ensure directory exists
   */
  async ensureDir(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      // Ignore if directory already exists
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }
}

/**
 * HTTP Client Wrapper Facade
 * Simplifies HTTP requests with retry logic and error handling
 */
class HttpClientFacade {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || '';
    this.timeout = options.timeout || 5000;
    this.retries = options.retries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.defaultHeaders = options.headers || {};
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request('GET', endpoint, null, options);
  }

  /**
   * POST request
   */
  async post(endpoint, data, options = {}) {
    return this.request('POST', endpoint, data, options);
  }

  /**
   * PUT request
   */
  async put(endpoint, data, options = {}) {
    return this.request('PUT', endpoint, data, options);
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, null, options);
  }

  /**
   * Generic request with retry logic
   */
  async request(method, endpoint, data = null, options = {}) {
    const url = this.buildUrl(endpoint);
    const headers = { ...this.defaultHeaders, ...options.headers };
    const retries = options.retries !== undefined ? options.retries : this.retries;

    let lastError = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.executeRequest(method, url, data, headers);
        return {
          success: true,
          data: response.data,
          status: response.status,
          headers: response.headers,
          attempt: attempt + 1
        };
      } catch (error) {
        lastError = error;

        if (attempt < retries) {
          await this.delay(this.retryDelay * (attempt + 1));
        }
      }
    }

    return {
      success: false,
      error: lastError.message,
      attempts: retries + 1
    };
  }

  /**
   * Execute HTTP request (mock implementation)
   */
  async executeRequest(method, url, data, headers) {
    // Simulate HTTP request
    await this.delay(Math.random() * 200);

    // Simulate occasional failures
    if (Math.random() < 0.2) {
      throw new Error('Network error');
    }

    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      data: {
        method,
        url,
        receivedData: data,
        timestamp: Date.now()
      }
    };
  }

  /**
   * Build full URL
   */
  buildUrl(endpoint) {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    return `${this.baseUrl}${endpoint}`;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Database Wrapper Facade
 * Simplifies database operations
 */
class DatabaseFacade {
  constructor(connectionString) {
    this.connectionString = connectionString;
    this.connected = false;
    this.pool = null;
    this.queryLog = [];
  }

  /**
   * Connect to database
   */
  async connect() {
    if (this.connected) {
      return { success: true, message: 'Already connected' };
    }

    try {
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 500));

      this.pool = {
        connections: 10,
        available: 10
      };

      this.connected = true;

      return { success: true, message: 'Connected to database' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    if (!this.connected) {
      return { success: true, message: 'Already disconnected' };
    }

    try {
      // Simulate disconnection
      await new Promise(resolve => setTimeout(resolve, 200));

      this.pool = null;
      this.connected = false;

      return { success: true, message: 'Disconnected from database' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute query with automatic connection handling
   */
  async query(sql, params = []) {
    if (!this.connected) {
      const result = await this.connect();
      if (!result.success) {
        return result;
      }
    }

    try {
      // Log query
      this.queryLog.push({
        sql,
        params,
        timestamp: Date.now()
      });

      // Simulate query execution
      await new Promise(resolve => setTimeout(resolve, 100));

      const rows = this.mockQueryResult(sql);

      return {
        success: true,
        rows,
        rowCount: rows.length,
        executionTime: 100
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Find one record
   */
  async findOne(table, conditions = {}) {
    const sql = `SELECT * FROM ${table} WHERE ${this.buildWhereClause(conditions)} LIMIT 1`;
    const result = await this.query(sql);

    if (result.success && result.rows.length > 0) {
      return { success: true, data: result.rows[0] };
    }

    return { success: false, error: 'Record not found' };
  }

  /**
   * Find many records
   */
  async findMany(table, conditions = {}, options = {}) {
    const limit = options.limit || 100;
    const offset = options.offset || 0;

    const sql = `SELECT * FROM ${table} WHERE ${this.buildWhereClause(conditions)} LIMIT ${limit} OFFSET ${offset}`;
    const result = await this.query(sql);

    if (result.success) {
      return { success: true, data: result.rows, count: result.rowCount };
    }

    return result;
  }

  /**
   * Insert record
   */
  async insert(table, data) {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data).map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${values})`;

    const result = await this.query(sql, Object.values(data));

    if (result.success) {
      return { success: true, id: Math.random().toString(36) };
    }

    return result;
  }

  /**
   * Update records
   */
  async update(table, data, conditions = {}) {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${this.buildWhereClause(conditions)}`;

    const result = await this.query(sql, Object.values(data));

    if (result.success) {
      return { success: true, updated: result.rowCount };
    }

    return result;
  }

  /**
   * Delete records
   */
  async delete(table, conditions = {}) {
    const sql = `DELETE FROM ${table} WHERE ${this.buildWhereClause(conditions)}`;
    const result = await this.query(sql);

    if (result.success) {
      return { success: true, deleted: result.rowCount };
    }

    return result;
  }

  /**
   * Helper: Build WHERE clause
   */
  buildWhereClause(conditions) {
    if (Object.keys(conditions).length === 0) {
      return '1=1';
    }
    return Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
  }

  /**
   * Mock query result
   */
  mockQueryResult(sql) {
    // Return mock data
    return [
      { id: 1, name: 'Item 1', value: 100 },
      { id: 2, name: 'Item 2', value: 200 }
    ];
  }

  /**
   * Get query log
   */
  getQueryLog() {
    return [...this.queryLog];
  }

  /**
   * Clear query log
   */
  clearQueryLog() {
    this.queryLog = [];
  }
}

/**
 * WebSocket Wrapper Facade
 * Simplifies WebSocket connection management
 */
class WebSocketFacade extends EventEmitter {
  constructor(url, options = {}) {
    super();
    this.url = url;
    this.reconnect = options.reconnect !== false;
    this.reconnectDelay = options.reconnectDelay || 5000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;

    this.ws = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.messageQueue = [];
  }

  /**
   * Connect to WebSocket
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        // Simulate WebSocket connection
        setTimeout(() => {
          this.ws = {
            readyState: 1, // OPEN
            send: (data) => this.simulateSend(data),
            close: () => this.handleClose()
          };

          this.connected = true;
          this.reconnectAttempts = 0;

          this.emit('connect');
          this.flushMessageQueue();

          resolve({ success: true, message: 'Connected' });
        }, 300);
      } catch (error) {
        reject({ success: false, error: error.message });
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    this.connected = false;
    this.emit('disconnect');
  }

  /**
   * Send message
   */
  async send(message) {
    if (!this.connected) {
      // Queue message if not connected
      this.messageQueue.push(message);

      if (this.reconnect) {
        await this.attemptReconnect();
      }

      return { success: false, error: 'Not connected', queued: true };
    }

    try {
      const data = typeof message === 'object' ? JSON.stringify(message) : message;
      this.ws.send(data);

      return { success: true, message: 'Sent' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle close event
   */
  handleClose() {
    this.connected = false;
    this.emit('close');

    if (this.reconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect
   */
  async attemptReconnect() {
    this.reconnectAttempts++;

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        this.emit('reconnect_failed', error);
      }
    }, this.reconnectDelay);
  }

  /**
   * Flush message queue
   */
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  /**
   * Simulate send
   */
  simulateSend(data) {
    this.emit('message_sent', data);
  }

  /**
   * Check connection status
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Get queued message count
   */
  getQueuedMessageCount() {
    return this.messageQueue.length;
  }
}

// ============================================================================
// COMPREHENSIVE EXAMPLES
// ============================================================================

/**
 * Example 1: File System Facade
 */
async function example1_FileSystemFacade() {
  console.log('\n=== Example 1: File System Facade ===\n');

  const fsFacade = new FileSystemFacade({
    baseDir: '/tmp/test-facade'
  });

  // Create directory
  console.log('Creating directory...');
  const createResult = await fsFacade.createDirectory('data');
  console.log('Create result:', createResult);

  // Write file
  console.log('\nWriting file...');
  const writeResult = await fsFacade.writeFile('data/test.txt', 'Hello, World!');
  console.log('Write result:', writeResult);

  // Read file
  console.log('\nReading file...');
  const readResult = await fsFacade.readFile('data/test.txt');
  console.log('Read result:', readResult.success ? readResult.content : readResult.error);

  // Check existence
  console.log('\nChecking file existence...');
  const exists = await fsFacade.exists('data/test.txt');
  console.log('File exists:', exists);

  // Get stats
  console.log('\nGetting file stats...');
  const stats = await fsFacade.getStats('data/test.txt');
  console.log('Stats:', stats.success ? `${stats.size} bytes` : stats.error);

  // List directory
  console.log('\nListing directory...');
  const listResult = await fsFacade.listDirectory('data');
  console.log('Items:', listResult.success ? listResult.items.length : listResult.error);
}

/**
 * Example 2: HTTP Client Facade
 */
async function example2_HttpClientFacade() {
  console.log('\n=== Example 2: HTTP Client Facade ===\n');

  const httpClient = new HttpClientFacade({
    baseUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3
  });

  // GET request
  console.log('Making GET request...');
  const getResult = await httpClient.get('/users/123');
  console.log('GET result:', getResult.success ? 'Success' : getResult.error);
  if (getResult.success) {
    console.log('Attempts:', getResult.attempt);
  }

  // POST request
  console.log('\nMaking POST request...');
  const postResult = await httpClient.post('/users', { name: 'John', email: 'john@example.com' });
  console.log('POST result:', postResult.success ? 'Success' : postResult.error);

  // PUT request
  console.log('\nMaking PUT request...');
  const putResult = await httpClient.put('/users/123', { name: 'John Doe' });
  console.log('PUT result:', putResult.success ? 'Success' : putResult.error);

  // DELETE request
  console.log('\nMaking DELETE request...');
  const deleteResult = await httpClient.delete('/users/123');
  console.log('DELETE result:', deleteResult.success ? 'Success' : deleteResult.error);
}

/**
 * Example 3: Database Facade
 */
async function example3_DatabaseFacade() {
  console.log('\n=== Example 3: Database Facade ===\n');

  const db = new DatabaseFacade('postgresql://localhost:5432/mydb');

  // Connect
  console.log('Connecting to database...');
  const connectResult = await db.connect();
  console.log('Connect result:', connectResult.message);

  // Insert
  console.log('\nInserting record...');
  const insertResult = await db.insert('users', { name: 'Alice', email: 'alice@example.com' });
  console.log('Insert result:', insertResult.success ? `ID: ${insertResult.id}` : insertResult.error);

  // Find one
  console.log('\nFinding one record...');
  const findOneResult = await db.findOne('users', { name: 'Alice' });
  console.log('Find one result:', findOneResult.success ? findOneResult.data : findOneResult.error);

  // Find many
  console.log('\nFinding many records...');
  const findManyResult = await db.findMany('users', {}, { limit: 10 });
  console.log('Find many result:', findManyResult.success ? `${findManyResult.count} records` : findManyResult.error);

  // Update
  console.log('\nUpdating records...');
  const updateResult = await db.update('users', { email: 'alice.new@example.com' }, { name: 'Alice' });
  console.log('Update result:', updateResult.success ? `${updateResult.updated} updated` : updateResult.error);

  // Query log
  console.log('\nQuery log entries:', db.getQueryLog().length);

  // Disconnect
  console.log('\nDisconnecting...');
  const disconnectResult = await db.disconnect();
  console.log('Disconnect result:', disconnectResult.message);
}

/**
 * Example 4: WebSocket Facade
 */
async function example4_WebSocketFacade() {
  console.log('\n=== Example 4: WebSocket Facade ===\n');

  const ws = new WebSocketFacade('ws://localhost:8080', {
    reconnect: true,
    reconnectDelay: 2000
  });

  // Event listeners
  ws.on('connect', () => console.log('WebSocket connected'));
  ws.on('disconnect', () => console.log('WebSocket disconnected'));
  ws.on('message_sent', (data) => console.log('Message sent:', data));

  // Connect
  console.log('Connecting to WebSocket...');
  const connectResult = await ws.connect();
  console.log('Connect result:', connectResult.message);

  // Send messages
  console.log('\nSending messages...');
  await ws.send({ type: 'greeting', text: 'Hello' });
  await ws.send({ type: 'data', value: 42 });
  await ws.send('Plain text message');

  console.log('Connection status:', ws.isConnected());

  // Disconnect
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('\nDisconnecting...');
  ws.disconnect();
}

/**
 * Example 5: Combining Facades
 */
async function example5_CombiningFacades() {
  console.log('\n=== Example 5: Combining Facades ===\n');

  const fsFacade = new FileSystemFacade({ baseDir: '/tmp/combined-test' });
  const db = new DatabaseFacade('postgresql://localhost:5432/mydb');

  // Connect to database
  await db.connect();

  // Fetch data from database
  console.log('Fetching data from database...');
  const data = await db.findMany('users', {}, { limit: 100 });

  if (data.success) {
    // Save to file
    console.log('Saving data to file...');
    const jsonData = JSON.stringify(data.data, null, 2);
    const writeResult = await fsFacade.writeFile('export/users.json', jsonData);
    console.log('Export result:', writeResult.success ? 'Success' : writeResult.error);

    // Read back
    console.log('\nReading exported file...');
    const readResult = await fsFacade.readFile('export/users.json');
    if (readResult.success) {
      const parsed = JSON.parse(readResult.content);
      console.log('Parsed records:', parsed.length);
    }
  }

  await db.disconnect();
}

/**
 * Example 6: Error Handling with Facades
 */
async function example6_ErrorHandling() {
  console.log('\n=== Example 6: Error Handling with Facades ===\n');

  const fsFacade = new FileSystemFacade();
  const httpClient = new HttpClientFacade({ retries: 2 });

  // Try to read non-existent file
  console.log('Attempting to read non-existent file...');
  const readResult = await fsFacade.readFile('/tmp/nonexistent.txt');
  if (!readResult.success) {
    console.log('Error handled gracefully:', readResult.error);
  }

  // HTTP request with retries (will fail)
  console.log('\nAttempting HTTP request with retries...');
  const httpResult = await httpClient.get('/api/test');
  if (!httpResult.success) {
    console.log('Failed after attempts:', httpResult.attempts);
  } else {
    console.log('Succeeded on attempt:', httpResult.attempt);
  }
}

/**
 * Main execution
 */
async function demonstrateWrapperFacade() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║      Wrapper Facade Pattern - Comprehensive Examples      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  await example1_FileSystemFacade();
  await example2_HttpClientFacade();
  await example3_DatabaseFacade();
  await example4_WebSocketFacade();
  await example5_CombiningFacades();
  await example6_ErrorHandling();

  console.log('\n✓ All Wrapper Facade pattern examples completed successfully!');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FileSystemFacade,
    HttpClientFacade,
    DatabaseFacade,
    WebSocketFacade,
    demonstrateWrapperFacade
  };
}

// Run examples if this file is executed directly
if (require.main === module) {
  demonstrateWrapperFacade().catch(console.error);
}
