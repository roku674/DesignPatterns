/**
 * Synchronous I/O Anti-Pattern
 *
 * PROBLEM:
 * Performing I/O operations synchronously blocks the event loop, preventing other
 * operations from executing. In Node.js, this is especially problematic as it
 * blocks all incoming requests.
 *
 * SYMPTOMS:
 * - Blocked event loop
 * - Poor concurrency
 * - Timeouts under load
 * - Unresponsive application
 * - Low throughput
 *
 * SOLUTION:
 * Use asynchronous I/O operations with promises/async-await, event-driven
 * architecture, and non-blocking operations.
 */

// ============================================================================
// SIMULATED I/O OPERATIONS
// ============================================================================

class FileSystem {
  constructor() {
    this.files = new Map([
      ['file1.txt', 'Content of file 1\n'.repeat(100)],
      ['file2.txt', 'Content of file 2\n'.repeat(100)],
      ['file3.txt', 'Content of file 3\n'.repeat(100)],
      ['file4.txt', 'Content of file 4\n'.repeat(100)],
      ['file5.txt', 'Content of file 5\n'.repeat(100)],
    ]);
    this.operationCount = 0;
  }

  // Simulated synchronous read (blocking)
  readFileSync(filename) {
    this.operationCount++;
    const start = Date.now();

    // Simulate blocking I/O
    while (Date.now() - start < 100) {
      // Busy wait - blocks everything!
    }

    console.log(`  [SYNC] Read ${filename} (blocked for 100ms)`);
    return this.files.get(filename) || '';
  }

  // Simulated asynchronous read (non-blocking)
  async readFileAsync(filename) {
    this.operationCount++;
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`  [ASYNC] Read ${filename} (non-blocking 100ms)`);
    return this.files.get(filename) || '';
  }

  getStats() {
    return { operationCount: this.operationCount };
  }

  reset() {
    this.operationCount = 0;
  }
}

class DatabaseClient {
  constructor() {
    this.queryCount = 0;
  }

  // Simulated synchronous query (blocking)
  querySync(sql) {
    this.queryCount++;
    const start = Date.now();

    // Simulate blocking database operation
    while (Date.now() - start < 50) {
      // Busy wait
    }

    console.log(`  [SYNC] Query executed (blocked for 50ms)`);
    return [{ id: 1, data: 'result' }];
  }

  // Simulated asynchronous query (non-blocking)
  async queryAsync(sql) {
    this.queryCount++;
    await new Promise(resolve => setTimeout(resolve, 50));
    console.log(`  [ASYNC] Query executed (non-blocking 50ms)`);
    return [{ id: 1, data: 'result' }];
  }

  getStats() {
    return { queryCount: this.queryCount };
  }

  reset() {
    this.queryCount = 0;
  }
}

// ============================================================================
// ANTI-PATTERN: Synchronous I/O
// ============================================================================

class SynchronousIOService {
  constructor(fileSystem, database) {
    this.fs = fileSystem;
    this.db = database;
  }

  // PROBLEM: Sequential synchronous operations block everything
  processFiles(filenames) {
    console.log('[SYNC] Processing files synchronously');
    const results = [];

    for (const filename of filenames) {
      // PROBLEM: Blocks event loop for each file
      const content = this.fs.readFileSync(filename);
      results.push({ filename, length: content.length });
    }

    console.log('PROBLEM: All operations blocked the event loop!\n');
    return results;
  }

  // PROBLEM: Synchronous database queries
  processData(records) {
    console.log('[SYNC] Processing database records synchronously');
    const results = [];

    for (const record of records) {
      // PROBLEM: Each query blocks
      const result = this.db.querySync(`SELECT * FROM table WHERE id = ${record.id}`);
      results.push(result[0]);
    }

    console.log('PROBLEM: Database operations blocked sequentially!\n');
    return results;
  }

  // PROBLEM: Mixed sync operations cause total blocking
  processRequest(fileList, recordIds) {
    console.log('[SYNC] Processing request with mixed I/O');

    // All blocking operations
    const files = this.processFiles(fileList);
    const records = this.processData(recordIds);

    console.log('PROBLEM: Entire request processing blocked!\n');
    return { files, records };
  }
}

// ============================================================================
// SOLUTION: Asynchronous I/O
// ============================================================================

class AsynchronousIOService {
  constructor(fileSystem, database) {
    this.fs = fileSystem;
    this.db = database;
  }

  // SOLUTION: Parallel asynchronous operations
  async processFiles(filenames) {
    console.log('[ASYNC] Processing files asynchronously');

    // SOLUTION: All reads happen in parallel
    const promises = filenames.map(async (filename) => {
      const content = await this.fs.readFileAsync(filename);
      return { filename, length: content.length };
    });

    const results = await Promise.all(promises);
    console.log('SUCCESS: All files read concurrently without blocking!\n');
    return results;
  }

  // SOLUTION: Parallel async database queries
  async processData(records) {
    console.log('[ASYNC] Processing database records asynchronously');

    // SOLUTION: All queries execute in parallel
    const promises = records.map(async (record) => {
      const result = await this.db.queryAsync(`SELECT * FROM table WHERE id = ${record.id}`);
      return result[0];
    });

    const results = await Promise.all(promises);
    console.log('SUCCESS: All queries executed concurrently!\n');
    return results;
  }

  // SOLUTION: Concurrent I/O operations
  async processRequest(fileList, recordIds) {
    console.log('[ASYNC] Processing request with concurrent I/O');

    // SOLUTION: Both operations happen in parallel
    const [files, records] = await Promise.all([
      this.processFiles(fileList),
      this.processData(recordIds)
    ]);

    console.log('SUCCESS: File and database operations ran concurrently!\n');
    return { files, records };
  }
}

// ============================================================================
// ADVANCED: Event-Driven Architecture
// ============================================================================

class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(listener);
  }

  emit(event, ...args) {
    const listeners = this.events.get(event) || [];
    listeners.forEach(listener => {
      // Execute asynchronously
      setImmediate(() => listener(...args));
    });
  }

  removeListener(event, listener) {
    const listeners = this.events.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }
}

class EventDrivenService extends EventEmitter {
  constructor(fileSystem, database) {
    super();
    this.fs = fileSystem;
    this.db = database;
    this.results = [];
  }

  async processFileAsync(filename) {
    console.log(`[EVENT] Starting to process ${filename}`);

    const content = await this.fs.readFileAsync(filename);

    // Emit event when done
    this.emit('file-processed', {
      filename,
      length: content.length,
      timestamp: Date.now()
    });

    return { filename, length: content.length };
  }

  async processWithEvents(filenames) {
    console.log('[EVENT] Processing with event-driven architecture');

    // Set up event listener
    this.on('file-processed', (result) => {
      console.log(`  [EVENT] File processed event: ${result.filename}`);
      this.results.push(result);
    });

    // Process all files asynchronously
    const promises = filenames.map(f => this.processFileAsync(f));
    await Promise.all(promises);

    console.log('SUCCESS: Event-driven non-blocking processing complete!\n');
    return this.results;
  }
}

// ============================================================================
// ADVANCED: Stream Processing for Large Data
// ============================================================================

class StreamProcessor {
  constructor() {
    this.processed = 0;
  }

  // Simulate processing large data in chunks (streaming)
  async *processStreamAsync(dataSize, chunkSize = 1000) {
    console.log(`[STREAM] Processing ${dataSize} items in chunks of ${chunkSize}`);

    for (let i = 0; i < dataSize; i += chunkSize) {
      // Process chunk asynchronously
      await new Promise(resolve => setTimeout(resolve, 10));

      const chunk = Math.min(chunkSize, dataSize - i);
      this.processed += chunk;

      console.log(`  [STREAM] Processed chunk: ${this.processed}/${dataSize}`);

      yield {
        processedSoFar: this.processed,
        total: dataSize,
        percentage: (this.processed / dataSize * 100).toFixed(1)
      };
    }

    console.log('SUCCESS: Stream processing complete without blocking!\n');
  }

  // ANTI-PATTERN: Process all at once (blocking for large data)
  processAllSync(dataSize) {
    console.log(`[SYNC] Processing ${dataSize} items all at once`);

    const start = Date.now();
    while (Date.now() - start < dataSize / 10) {
      // Simulate blocking work
    }

    console.log('PROBLEM: Processed everything in one blocking operation!\n');
    return { processed: dataSize };
  }
}

// ============================================================================
// DEMONSTRATION
// ============================================================================

async function demonstrateSynchronousIO() {
  console.log('='.repeat(80));
  console.log('SYNCHRONOUS I/O ANTI-PATTERN DEMONSTRATION');
  console.log('='.repeat(80));

  const fileList = ['file1.txt', 'file2.txt', 'file3.txt'];
  const recordIds = [{ id: 1 }, { id: 2 }, { id: 3 }];

  console.log('\n--- ANTI-PATTERN: Synchronous I/O (Blocking) ---\n');
  const syncFs = new FileSystem();
  const syncDb = new DatabaseClient();
  const syncService = new SynchronousIOService(syncFs, syncDb);

  const syncStart = Date.now();

  // PROBLEM: This blocks the event loop completely
  syncService.processRequest(fileList, recordIds);

  const syncTime = Date.now() - syncStart;
  console.log(`Synchronous Statistics:`);
  console.log(`  Total Time: ${syncTime}ms`);
  console.log(`  File Operations: ${syncFs.getStats().operationCount}`);
  console.log(`  Database Queries: ${syncDb.getStats().queryCount}`);
  console.log('  PROBLEM: Event loop was blocked the entire time!\n');

  console.log('\n--- SOLUTION: Asynchronous I/O (Non-Blocking) ---\n');
  const asyncFs = new FileSystem();
  const asyncDb = new DatabaseClient();
  const asyncService = new AsynchronousIOService(asyncFs, asyncDb);

  const asyncStart = Date.now();

  // SOLUTION: Event loop remains free to handle other operations
  await asyncService.processRequest(fileList, recordIds);

  const asyncTime = Date.now() - asyncStart;
  console.log(`Asynchronous Statistics:`);
  console.log(`  Total Time: ${asyncTime}ms`);
  console.log(`  File Operations: ${asyncFs.getStats().operationCount}`);
  console.log(`  Database Queries: ${asyncDb.getStats().queryCount}`);
  console.log(`  SUCCESS: ${((1 - asyncTime / syncTime) * 100).toFixed(1)}% faster with non-blocking I/O!\n`);

  console.log('\n--- SOLUTION: Event-Driven Architecture ---\n');
  const eventFs = new FileSystem();
  const eventDb = new DatabaseClient();
  const eventService = new EventDrivenService(eventFs, eventDb);

  await eventService.processWithEvents(fileList);

  console.log('\n--- SOLUTION: Stream Processing ---\n');
  const streamProcessor = new StreamProcessor();

  // Process large dataset in chunks
  const stream = streamProcessor.processStreamAsync(10000, 2000);
  for await (const progress of stream) {
    // Can do other work while streaming
    console.log(`    Progress: ${progress.percentage}%`);
  }

  console.log('='.repeat(80));
  console.log('KEY TAKEAWAYS:');
  console.log('='.repeat(80));
  console.log('1. Always use async I/O operations in Node.js');
  console.log('2. Use Promise.all() for parallel async operations');
  console.log('3. Never block the event loop with synchronous operations');
  console.log('4. Use streams for large data processing');
  console.log('5. Implement event-driven architecture for decoupling');
  console.log('6. Use async/await for cleaner async code');
  console.log('7. Monitor event loop lag in production');
  console.log('8. Use worker threads for CPU-intensive tasks');
  console.log('='.repeat(80));
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  FileSystem,
  DatabaseClient,
  SynchronousIOService,
  AsynchronousIOService,
  EventEmitter,
  EventDrivenService,
  StreamProcessor,
  demonstrateSynchronousIO
};

// Run demonstration if executed directly
if (require.main === module) {
  demonstrateSynchronousIO().catch(console.error);
}
