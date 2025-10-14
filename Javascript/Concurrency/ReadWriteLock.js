/**
 * ReadWriteLock Pattern
 *
 * Purpose:
 * Allows multiple concurrent readers or a single writer, preventing data races
 * while maximizing parallelism for read operations.
 *
 * Use Cases:
 * - Shared cache access
 * - Configuration management
 * - Database connection pools
 * - Shared resource management
 *
 * @author Design Patterns Implementation
 * @date 2025
 */

/**
 * Lock types
 */
const LockType = {
  READ: 'read',
  WRITE: 'write'
};

/**
 * Lock request tracking
 */
class LockRequest {
  constructor(type, priority = 0) {
    this.id = Math.random().toString(36).substring(7);
    this.type = type;
    this.priority = priority;
    this.timestamp = Date.now();
    this.resolve = null;
    this.reject = null;
    this.acquired = false;
  }

  createPromise() {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

/**
 * ReadWriteLock implementation
 * Manages concurrent read access and exclusive write access
 */
class ReadWriteLock {
  constructor(options = {}) {
    this.readersPreferred = options.readersPreferred !== false;
    this.maxReaders = options.maxReaders || Infinity;
    this.timeout = options.timeout || 30000;

    this.activeReaders = 0;
    this.activeWriters = 0;
    this.waitingReaders = [];
    this.waitingWriters = [];

    this.stats = {
      totalReadsAcquired: 0,
      totalWritesAcquired: 0,
      totalReadsReleased: 0,
      totalWritesReleased: 0,
      totalTimeouts: 0,
      totalRejections: 0
    };
  }

  /**
   * Acquire a read lock
   */
  async acquireRead(priority = 0) {
    const request = new LockRequest(LockType.READ, priority);
    const promise = request.createPromise();

    // Can acquire immediately if no active writers and no waiting writers (or readers preferred)
    if (this.activeWriters === 0 &&
        (this.waitingWriters.length === 0 || this.readersPreferred) &&
        this.activeReaders < this.maxReaders) {
      this.activeReaders++;
      this.stats.totalReadsAcquired++;
      request.acquired = true;
      request.resolve();
      return this.createReleaseFunction(LockType.READ);
    }

    // Add to waiting queue
    this.waitingReaders.push(request);
    this.waitingReaders.sort((a, b) => b.priority - a.priority);

    // Set timeout
    const timeoutId = setTimeout(() => {
      this.removeWaitingRequest(request);
      this.stats.totalTimeouts++;
      request.reject(new Error(`Read lock acquisition timeout after ${this.timeout}ms`));
    }, this.timeout);

    await promise;
    clearTimeout(timeoutId);

    return this.createReleaseFunction(LockType.READ);
  }

  /**
   * Acquire a write lock
   */
  async acquireWrite(priority = 0) {
    const request = new LockRequest(LockType.WRITE, priority);
    const promise = request.createPromise();

    // Can acquire immediately if no active readers or writers
    if (this.activeReaders === 0 && this.activeWriters === 0) {
      this.activeWriters++;
      this.stats.totalWritesAcquired++;
      request.acquired = true;
      request.resolve();
      return this.createReleaseFunction(LockType.WRITE);
    }

    // Add to waiting queue
    this.waitingWriters.push(request);
    this.waitingWriters.sort((a, b) => b.priority - a.priority);

    // Set timeout
    const timeoutId = setTimeout(() => {
      this.removeWaitingRequest(request);
      this.stats.totalTimeouts++;
      request.reject(new Error(`Write lock acquisition timeout after ${this.timeout}ms`));
    }, this.timeout);

    await promise;
    clearTimeout(timeoutId);

    return this.createReleaseFunction(LockType.WRITE);
  }

  /**
   * Release a read lock
   */
  releaseRead() {
    if (this.activeReaders <= 0) {
      throw new Error('No active read locks to release');
    }

    this.activeReaders--;
    this.stats.totalReadsReleased++;
    this.processWaitingRequests();
  }

  /**
   * Release a write lock
   */
  releaseWrite() {
    if (this.activeWriters <= 0) {
      throw new Error('No active write locks to release');
    }

    this.activeWriters--;
    this.stats.totalWritesReleased++;
    this.processWaitingRequests();
  }

  /**
   * Create a release function for the lock
   */
  createReleaseFunction(type) {
    let released = false;
    return () => {
      if (released) {
        throw new Error('Lock already released');
      }
      released = true;

      if (type === LockType.READ) {
        this.releaseRead();
      } else {
        this.releaseWrite();
      }
    };
  }

  /**
   * Process waiting lock requests
   */
  processWaitingRequests() {
    // If no active locks, try to grant waiting locks
    if (this.activeReaders === 0 && this.activeWriters === 0) {
      // Prefer writers if not in readers-preferred mode
      if (!this.readersPreferred && this.waitingWriters.length > 0) {
        const request = this.waitingWriters.shift();
        this.activeWriters++;
        this.stats.totalWritesAcquired++;
        request.acquired = true;
        request.resolve();
      } else if (this.waitingReaders.length > 0) {
        // Grant all waiting readers
        while (this.waitingReaders.length > 0 &&
               this.activeReaders < this.maxReaders) {
          const request = this.waitingReaders.shift();
          this.activeReaders++;
          this.stats.totalReadsAcquired++;
          request.acquired = true;
          request.resolve();
        }
      } else if (this.waitingWriters.length > 0) {
        const request = this.waitingWriters.shift();
        this.activeWriters++;
        this.stats.totalWritesAcquired++;
        request.acquired = true;
        request.resolve();
      }
    }
    // If only readers are active and readers preferred, allow more readers
    else if (this.activeWriters === 0 &&
             this.readersPreferred &&
             this.waitingReaders.length > 0) {
      while (this.waitingReaders.length > 0 &&
             this.activeReaders < this.maxReaders) {
        const request = this.waitingReaders.shift();
        this.activeReaders++;
        this.stats.totalReadsAcquired++;
        request.acquired = true;
        request.resolve();
      }
    }
  }

  /**
   * Remove a waiting request
   */
  removeWaitingRequest(request) {
    if (request.type === LockType.READ) {
      const index = this.waitingReaders.indexOf(request);
      if (index !== -1) {
        this.waitingReaders.splice(index, 1);
      }
    } else {
      const index = this.waitingWriters.indexOf(request);
      if (index !== -1) {
        this.waitingWriters.splice(index, 1);
      }
    }
  }

  /**
   * Get current lock status
   */
  getStatus() {
    return {
      activeReaders: this.activeReaders,
      activeWriters: this.activeWriters,
      waitingReaders: this.waitingReaders.length,
      waitingWriters: this.waitingWriters.length,
      stats: { ...this.stats }
    };
  }

  /**
   * Execute a function with read lock
   */
  async withReadLock(fn, priority = 0) {
    const release = await this.acquireRead(priority);
    try {
      return await fn();
    } finally {
      release();
    }
  }

  /**
   * Execute a function with write lock
   */
  async withWriteLock(fn, priority = 0) {
    const release = await this.acquireWrite(priority);
    try {
      return await fn();
    } finally {
      release();
    }
  }
}

/**
 * Thread-safe shared resource using ReadWriteLock
 */
class SharedResource {
  constructor(initialValue = null) {
    this.value = initialValue;
    this.lock = new ReadWriteLock();
    this.version = 0;
    this.accessLog = [];
  }

  async read() {
    return await this.lock.withReadLock(async () => {
      this.logAccess('read');
      await this.simulateDelay(50, 150);
      return { value: this.value, version: this.version };
    });
  }

  async write(newValue) {
    return await this.lock.withWriteLock(async () => {
      this.logAccess('write');
      await this.simulateDelay(100, 300);
      this.value = newValue;
      this.version++;
      return this.version;
    });
  }

  async update(updateFn) {
    return await this.lock.withWriteLock(async () => {
      this.logAccess('update');
      await this.simulateDelay(100, 300);
      this.value = await updateFn(this.value);
      this.version++;
      return this.version;
    });
  }

  logAccess(type) {
    this.accessLog.push({
      type,
      timestamp: Date.now(),
      version: this.version
    });
  }

  simulateDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  getAccessLog() {
    return [...this.accessLog];
  }

  getLockStatus() {
    return this.lock.getStatus();
  }
}

/**
 * Advanced cache with ReadWriteLock
 */
class ThreadSafeCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.lock = new ReadWriteLock(options);
    this.maxSize = options.maxSize || 1000;
    this.ttl = options.ttl || 60000; // 1 minute default
    this.hits = 0;
    this.misses = 0;
  }

  async get(key) {
    return await this.lock.withReadLock(async () => {
      const entry = this.cache.get(key);

      if (!entry) {
        this.misses++;
        return null;
      }

      if (Date.now() - entry.timestamp > this.ttl) {
        this.misses++;
        return null;
      }

      this.hits++;
      return entry.value;
    });
  }

  async set(key, value) {
    return await this.lock.withWriteLock(async () => {
      // Evict if cache is full
      if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }

      this.cache.set(key, {
        value,
        timestamp: Date.now()
      });

      return true;
    });
  }

  async delete(key) {
    return await this.lock.withWriteLock(async () => {
      return this.cache.delete(key);
    });
  }

  async clear() {
    return await this.lock.withWriteLock(async () => {
      this.cache.clear();
      this.hits = 0;
      this.misses = 0;
    });
  }

  async getStats() {
    return await this.lock.withReadLock(async () => {
      return {
        size: this.cache.size,
        hits: this.hits,
        misses: this.misses,
        hitRate: this.hits / (this.hits + this.misses) || 0,
        lockStatus: this.lock.getStatus()
      };
    });
  }
}

// ============================================================================
// COMPREHENSIVE EXAMPLES
// ============================================================================

/**
 * Example 1: Basic Read-Write Lock Usage
 */
async function example1_BasicUsage() {
  console.log('\n=== Example 1: Basic Read-Write Lock Usage ===\n');

  const lock = new ReadWriteLock();

  // Multiple readers can acquire the lock concurrently
  console.log('Acquiring multiple read locks...');
  const reader1 = await lock.acquireRead();
  console.log('Reader 1 acquired');

  const reader2 = await lock.acquireRead();
  console.log('Reader 2 acquired');

  const reader3 = await lock.acquireRead();
  console.log('Reader 3 acquired');

  console.log('\nLock status:', lock.getStatus());

  // Release readers
  reader1();
  reader2();
  reader3();

  console.log('All readers released');

  // Writer has exclusive access
  console.log('\nAcquiring write lock...');
  const writer = await lock.acquireWrite();
  console.log('Writer acquired (exclusive access)');

  console.log('\nLock status:', lock.getStatus());

  writer();
  console.log('Writer released');
}

/**
 * Example 2: Shared Resource Access
 */
async function example2_SharedResource() {
  console.log('\n=== Example 2: Shared Resource Access ===\n');

  const resource = new SharedResource({ counter: 0, data: [] });

  // Multiple readers
  const readers = [];
  for (let i = 0; i < 5; i++) {
    readers.push(
      resource.read().then(result => {
        console.log(`Reader ${i} read:`, result.value);
      })
    );
  }

  // A writer
  const writer1 = resource.write({ counter: 1, data: ['item1'] }).then(version => {
    console.log(`Writer 1 updated to version ${version}`);
  });

  // More readers
  for (let i = 5; i < 10; i++) {
    readers.push(
      resource.read().then(result => {
        console.log(`Reader ${i} read:`, result.value);
      })
    );
  }

  await Promise.all([...readers, writer1]);

  console.log('\nFinal lock status:', resource.getLockStatus());
  console.log('Access log entries:', resource.getAccessLog().length);
}

/**
 * Example 3: Thread-Safe Cache
 */
async function example3_ThreadSafeCache() {
  console.log('\n=== Example 3: Thread-Safe Cache ===\n');

  const cache = new ThreadSafeCache({ maxSize: 100, ttl: 5000 });

  // Concurrent writes
  const writes = [];
  for (let i = 0; i < 10; i++) {
    writes.push(
      cache.set(`key${i}`, { id: i, data: `value${i}` }).then(() => {
        console.log(`Set key${i}`);
      })
    );
  }

  await Promise.all(writes);

  // Concurrent reads
  const reads = [];
  for (let i = 0; i < 20; i++) {
    const key = `key${i % 10}`;
    reads.push(
      cache.get(key).then(value => {
        console.log(`Read ${key}:`, value ? value.data : 'null');
      })
    );
  }

  await Promise.all(reads);

  const stats = await cache.getStats();
  console.log('\nCache stats:', stats);
}

/**
 * Example 4: Priority-based Lock Acquisition
 */
async function example4_PriorityLocks() {
  console.log('\n=== Example 4: Priority-based Lock Acquisition ===\n');

  const lock = new ReadWriteLock();

  // Acquire a write lock to block others
  const initialWriter = await lock.acquireWrite();
  console.log('Initial writer acquired (blocking all)');

  // Queue up requests with different priorities
  const lowPriorityRead = lock.acquireRead(0).then(() => {
    console.log('Low priority read acquired');
    return 'low';
  });

  const highPriorityRead = lock.acquireRead(10).then(() => {
    console.log('High priority read acquired');
    return 'high';
  });

  const normalPriorityRead = lock.acquireRead(5).then(() => {
    console.log('Normal priority read acquired');
    return 'normal';
  });

  // Wait a bit to ensure requests are queued
  await new Promise(resolve => setTimeout(resolve, 100));

  console.log('\nReleasing initial writer...');
  initialWriter();

  // Wait for all reads to complete
  const results = await Promise.all([
    highPriorityRead,
    normalPriorityRead,
    lowPriorityRead
  ]);

  console.log('\nExecution order:', results);
}

/**
 * Example 5: Lock Timeout Handling
 */
async function example5_LockTimeout() {
  console.log('\n=== Example 5: Lock Timeout Handling ===\n');

  const lock = new ReadWriteLock({ timeout: 1000 });

  // Acquire write lock
  const writer = await lock.acquireWrite();
  console.log('Writer acquired');

  // Try to acquire another write lock (will timeout)
  try {
    console.log('Attempting to acquire second write lock...');
    await lock.acquireWrite();
    console.log('Second writer acquired');
  } catch (error) {
    console.log('Timeout occurred:', error.message);
  }

  writer();
  console.log('First writer released');

  // Now we can acquire the write lock
  const writer2 = await lock.acquireWrite();
  console.log('Second writer acquired successfully');
  writer2();

  console.log('\nLock stats:', lock.getStatus().stats);
}

/**
 * Example 6: Database Connection Pool Simulation
 */
async function example6_DatabasePool() {
  console.log('\n=== Example 6: Database Connection Pool Simulation ===\n');

  class DatabasePool {
    constructor() {
      this.connections = new Array(5).fill(null).map((_, i) => ({
        id: i,
        busy: false
      }));
      this.lock = new ReadWriteLock();
      this.transactionLog = [];
    }

    async executeQuery(query) {
      return await this.lock.withReadLock(async () => {
        const connection = this.connections.find(c => !c.busy);
        if (!connection) {
          throw new Error('No available connections');
        }

        connection.busy = true;
        console.log(`Executing query on connection ${connection.id}: ${query}`);

        await new Promise(resolve => setTimeout(resolve, Math.random() * 500));

        connection.busy = false;
        return { success: true, connectionId: connection.id };
      });
    }

    async executeTransaction(queries) {
      return await this.lock.withWriteLock(async () => {
        console.log(`Executing transaction with ${queries.length} queries`);

        const results = [];
        for (const query of queries) {
          await new Promise(resolve => setTimeout(resolve, 100));
          results.push({ query, success: true });
        }

        this.transactionLog.push({
          timestamp: Date.now(),
          queries: queries.length
        });

        return results;
      });
    }
  }

  const pool = new DatabasePool();

  // Concurrent queries (can run in parallel)
  const queries = [];
  for (let i = 0; i < 10; i++) {
    queries.push(pool.executeQuery(`SELECT * FROM table${i}`));
  }

  // A transaction (requires exclusive access)
  const transaction = pool.executeTransaction([
    'BEGIN',
    'UPDATE accounts SET balance = balance - 100',
    'UPDATE accounts SET balance = balance + 100',
    'COMMIT'
  ]);

  await Promise.all([...queries, transaction]);

  console.log('\nTransaction log:', pool.transactionLog);
}

/**
 * Main execution
 */
async function demonstrateReadWriteLock() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║      ReadWriteLock Pattern - Comprehensive Examples        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  await example1_BasicUsage();
  await example2_SharedResource();
  await example3_ThreadSafeCache();
  await example4_PriorityLocks();
  await example5_LockTimeout();
  await example6_DatabasePool();

  console.log('\n✓ All ReadWriteLock pattern examples completed successfully!');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ReadWriteLock,
    SharedResource,
    ThreadSafeCache,
    LockType,
    demonstrateReadWriteLock
  };
}

// Run examples if this file is executed directly
if (require.main === module) {
  demonstrateReadWriteLock().catch(console.error);
}
