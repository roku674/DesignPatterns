/**
 * Sequential Convoy Anti-Pattern
 *
 * PROBLEM:
 * Messages related to the same entity arrive out of order, causing race conditions
 * and inconsistent state. This happens when messages are processed in parallel
 * without maintaining order guarantees.
 *
 * SYMPTOMS:
 * - Race conditions in message processing
 * - Data inconsistencies
 * - Lost updates
 * - Unexpected final state
 *
 * SOLUTION:
 * Use message session IDs or partition keys to ensure related messages
 * are processed in order.
 */

// ============================================================================
// ANTI-PATTERN: Unordered Message Processing
// ============================================================================

class UnorderedMessageProcessor {
  constructor() {
    this.results = new Map();
    this.processingDelay = 100; // Simulated processing time
  }

  async processMessage(message) {
    const { entityId, action, value, timestamp } = message;

    console.log(`[ANTI-PATTERN] Processing message for entity ${entityId}: ${action}`);

    // Simulate varying processing times that can cause reordering
    const delay = Math.random() * this.processingDelay;
    await this.sleep(delay);

    // PROBLEM: No ordering guarantee - later messages might process first
    const currentState = this.results.get(entityId) || { value: 0, lastUpdate: 0 };

    switch (action) {
      case 'SET':
        currentState.value = value;
        break;
      case 'INCREMENT':
        currentState.value += value;
        break;
      case 'DECREMENT':
        currentState.value -= value;
        break;
      case 'MULTIPLY':
        currentState.value *= value;
        break;
    }

    currentState.lastUpdate = timestamp;
    this.results.set(entityId, currentState);

    console.log(`[ANTI-PATTERN] Entity ${entityId} state: ${currentState.value}`);
    return currentState;
  }

  async processMessageBatch(messages) {
    // PROBLEM: Processing all messages in parallel without order guarantee
    const promises = messages.map(msg => this.processMessage(msg));
    return Promise.all(promises);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getResult(entityId) {
    return this.results.get(entityId);
  }

  clear() {
    this.results.clear();
  }
}

// ============================================================================
// SOLUTION 1: Session-Based Sequential Processing
// ============================================================================

class SessionBasedMessageProcessor {
  constructor() {
    this.results = new Map();
    this.sessionQueues = new Map();
    this.processing = new Set();
  }

  async processMessage(message) {
    const { entityId, sessionId, action, value, timestamp } = message;

    if (!sessionId) {
      throw new Error('Message must have a sessionId for sequential processing');
    }

    // Ensure all messages with the same sessionId are processed sequentially
    const queueKey = `${entityId}-${sessionId}`;

    if (!this.sessionQueues.has(queueKey)) {
      this.sessionQueues.set(queueKey, []);
    }

    const queue = this.sessionQueues.get(queueKey);

    return new Promise((resolve, reject) => {
      queue.push({ message, resolve, reject });

      // If not already processing this queue, start processing
      if (!this.processing.has(queueKey)) {
        this.processQueue(queueKey);
      }
    });
  }

  async processQueue(queueKey) {
    this.processing.add(queueKey);
    const queue = this.sessionQueues.get(queueKey);

    while (queue.length > 0) {
      const { message, resolve, reject } = queue.shift();

      try {
        const result = await this.processMessageInOrder(message);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.processing.delete(queueKey);
    this.sessionQueues.delete(queueKey);
  }

  async processMessageInOrder(message) {
    const { entityId, action, value, timestamp } = message;

    console.log(`[SESSION-BASED] Processing message for entity ${entityId}: ${action}`);

    const currentState = this.results.get(entityId) || { value: 0, lastUpdate: 0, history: [] };

    // Check for out-of-order messages
    if (timestamp < currentState.lastUpdate) {
      console.warn(`[SESSION-BASED] Out-of-order message detected for entity ${entityId}`);
      return currentState; // Discard out-of-order message
    }

    switch (action) {
      case 'SET':
        currentState.value = value;
        break;
      case 'INCREMENT':
        currentState.value += value;
        break;
      case 'DECREMENT':
        currentState.value -= value;
        break;
      case 'MULTIPLY':
        currentState.value *= value;
        break;
    }

    currentState.lastUpdate = timestamp;
    currentState.history.push({ action, value, timestamp, result: currentState.value });

    this.results.set(entityId, currentState);

    console.log(`[SESSION-BASED] Entity ${entityId} state: ${currentState.value}`);
    return { ...currentState };
  }

  getResult(entityId) {
    return this.results.get(entityId);
  }

  clear() {
    this.results.clear();
    this.sessionQueues.clear();
    this.processing.clear();
  }
}

// ============================================================================
// SOLUTION 2: Partition Key-Based Ordering
// ============================================================================

class PartitionKeyProcessor {
  constructor(partitionCount = 4) {
    this.partitionCount = partitionCount;
    this.partitions = Array.from({ length: partitionCount }, () => ({
      queue: [],
      processing: false,
      results: new Map()
    }));
  }

  getPartition(partitionKey) {
    // Hash the partition key to determine which partition to use
    let hash = 0;
    for (let i = 0; i < partitionKey.length; i++) {
      hash = ((hash << 5) - hash) + partitionKey.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % this.partitionCount;
  }

  async processMessage(message) {
    const { partitionKey } = message;

    if (!partitionKey) {
      throw new Error('Message must have a partitionKey for ordered processing');
    }

    const partitionIndex = this.getPartition(partitionKey);
    const partition = this.partitions[partitionIndex];

    return new Promise((resolve, reject) => {
      partition.queue.push({ message, resolve, reject });

      if (!partition.processing) {
        this.processPartition(partitionIndex);
      }
    });
  }

  async processPartition(partitionIndex) {
    const partition = this.partitions[partitionIndex];
    partition.processing = true;

    while (partition.queue.length > 0) {
      const { message, resolve, reject } = partition.queue.shift();

      try {
        const result = await this.processMessageInPartition(message, partition);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    partition.processing = false;
  }

  async processMessageInPartition(message, partition) {
    const { entityId, action, value, timestamp, partitionKey } = message;

    console.log(`[PARTITION] Processing message for entity ${entityId} (partition: ${partitionKey}): ${action}`);

    const currentState = partition.results.get(entityId) || {
      value: 0,
      lastUpdate: 0,
      messageCount: 0
    };

    switch (action) {
      case 'SET':
        currentState.value = value;
        break;
      case 'INCREMENT':
        currentState.value += value;
        break;
      case 'DECREMENT':
        currentState.value -= value;
        break;
      case 'MULTIPLY':
        currentState.value *= value;
        break;
    }

    currentState.lastUpdate = timestamp;
    currentState.messageCount++;

    partition.results.set(entityId, currentState);

    console.log(`[PARTITION] Entity ${entityId} state: ${currentState.value} (${currentState.messageCount} messages)`);
    return { ...currentState };
  }

  getResult(entityId, partitionKey) {
    const partitionIndex = this.getPartition(partitionKey);
    return this.partitions[partitionIndex].results.get(entityId);
  }

  getAllResults() {
    const allResults = new Map();
    this.partitions.forEach((partition, index) => {
      partition.results.forEach((value, key) => {
        allResults.set(`${key}-p${index}`, value);
      });
    });
    return allResults;
  }

  clear() {
    this.partitions.forEach(partition => {
      partition.queue = [];
      partition.processing = false;
      partition.results.clear();
    });
  }
}

// ============================================================================
// DEMONSTRATION: Sequential Convoy Problem and Solutions
// ============================================================================

async function demonstrateSequentialConvoy() {
  console.log('='.repeat(80));
  console.log('SEQUENTIAL CONVOY ANTI-PATTERN DEMONSTRATION');
  console.log('='.repeat(80));

  // Create a series of messages that should be processed in order
  const orderedMessages = [
    { entityId: 'account-1', action: 'SET', value: 100, timestamp: 1000 },
    { entityId: 'account-1', action: 'INCREMENT', value: 50, timestamp: 2000 },
    { entityId: 'account-1', action: 'DECREMENT', value: 30, timestamp: 3000 },
    { entityId: 'account-1', action: 'MULTIPLY', value: 2, timestamp: 4000 },
  ];

  // Expected result: 100 + 50 - 30 = 120, then 120 * 2 = 240

  console.log('\n--- ANTI-PATTERN: Unordered Processing ---');
  const unorderedProcessor = new UnorderedMessageProcessor();

  // Process messages - they may complete out of order
  await unorderedProcessor.processMessageBatch(orderedMessages);
  const unorderedResult = unorderedProcessor.getResult('account-1');
  console.log(`\nFinal result (UNORDERED): ${unorderedResult.value}`);
  console.log('NOTE: Result may be incorrect due to race conditions!\n');

  console.log('\n--- SOLUTION 1: Session-Based Sequential Processing ---');
  const sessionProcessor = new SessionBasedMessageProcessor();

  const sessionMessages = orderedMessages.map(msg => ({
    ...msg,
    sessionId: 'session-1' // All messages with same sessionId processed in order
  }));

  const sessionPromises = sessionMessages.map(msg => sessionProcessor.processMessage(msg));
  await Promise.all(sessionPromises);

  const sessionResult = sessionProcessor.getResult('account-1');
  console.log(`\nFinal result (SESSION-BASED): ${sessionResult.value}`);
  console.log('Expected: 240');
  console.log(`Correct: ${sessionResult.value === 240 ? 'YES' : 'NO'}\n`);

  console.log('\n--- SOLUTION 2: Partition Key-Based Ordering ---');
  const partitionProcessor = new PartitionKeyProcessor(4);

  const partitionMessages = orderedMessages.map(msg => ({
    ...msg,
    partitionKey: msg.entityId // Messages with same partitionKey processed in order
  }));

  const partitionPromises = partitionMessages.map(msg => partitionProcessor.processMessage(msg));
  await Promise.all(partitionPromises);

  const partitionResult = partitionProcessor.getResult('account-1', 'account-1');
  console.log(`\nFinal result (PARTITION-BASED): ${partitionResult.value}`);
  console.log('Expected: 240');
  console.log(`Correct: ${partitionResult.value === 240 ? 'YES' : 'NO'}\n`);

  console.log('='.repeat(80));
  console.log('KEY TAKEAWAYS:');
  console.log('='.repeat(80));
  console.log('1. Use session IDs or partition keys to ensure message ordering');
  console.log('2. Process messages with the same session/partition key sequentially');
  console.log('3. Different sessions/partitions can still be processed in parallel');
  console.log('4. Consider using message brokers with ordering guarantees (Azure Service Bus sessions)');
  console.log('5. Implement idempotency to handle duplicate messages');
  console.log('='.repeat(80));
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  UnorderedMessageProcessor,
  SessionBasedMessageProcessor,
  PartitionKeyProcessor,
  demonstrateSequentialConvoy
};

// Run demonstration if executed directly
if (require.main === module) {
  demonstrateSequentialConvoy().catch(console.error);
}
