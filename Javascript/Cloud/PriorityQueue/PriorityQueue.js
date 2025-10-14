/**
 * Priority Queue Pattern Implementation
 *
 * Priority Queue processes messages based on priority levels rather than FIFO order.
 * Higher priority messages are processed before lower priority messages.
 *
 * Key Components:
 * - Priority Heap: Binary heap for O(log n) operations
 * - Message Queue: Queue implementation with priority support
 * - Priority Levels: Configurable priority tiers
 * - Queue Processor: Processes messages based on priority
 * - Metrics: Track queue statistics and processing times
 */

/**
 * Priority Levels
 */
const PriorityLevel = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
    BACKGROUND: 4
};

/**
 * Message Class
 */
class Message {
    constructor(id, data, priority = PriorityLevel.MEDIUM, options = {}) {
        this.id = id;
        this.data = data;
        this.priority = priority;
        this.createdAt = Date.now();
        this.processedAt = null;
        this.attempts = 0;
        this.maxRetries = options.maxRetries || 3;
        this.timeout = options.timeout || 30000;
        this.metadata = options.metadata || {};
    }

    markProcessed() {
        this.processedAt = Date.now();
    }

    getWaitTime() {
        return this.processedAt ? this.processedAt - this.createdAt : Date.now() - this.createdAt;
    }

    canRetry() {
        return this.attempts < this.maxRetries;
    }

    incrementAttempts() {
        this.attempts++;
    }
}

/**
 * Min Heap implementation for priority queue
 */
class MinHeap {
    constructor(compareFn) {
        this.heap = [];
        this.compareFn = compareFn || ((a, b) => a - b);
    }

    size() {
        return this.heap.length;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    peek() {
        return this.heap[0];
    }

    push(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    pop() {
        if (this.isEmpty()) {
            return null;
        }

        if (this.size() === 1) {
            return this.heap.pop();
        }

        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown(0);
        return min;
    }

    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.compareFn(this.heap[index], this.heap[parentIndex]) >= 0) {
                break;
            }
            this.swap(index, parentIndex);
            index = parentIndex;
        }
    }

    bubbleDown(index) {
        while (true) {
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            let smallest = index;

            if (leftChild < this.size() &&
                this.compareFn(this.heap[leftChild], this.heap[smallest]) < 0) {
                smallest = leftChild;
            }

            if (rightChild < this.size() &&
                this.compareFn(this.heap[rightChild], this.heap[smallest]) < 0) {
                smallest = rightChild;
            }

            if (smallest === index) {
                break;
            }

            this.swap(index, smallest);
            index = smallest;
        }
    }

    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    clear() {
        this.heap = [];
    }

    toArray() {
        return [...this.heap];
    }
}

/**
 * Priority Queue implementation
 */
class PriorityQueue {
    constructor(options = {}) {
        this.heap = new MinHeap((a, b) => {
            // Compare by priority first, then by creation time
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            return a.createdAt - b.createdAt;
        });

        this.maxSize = options.maxSize || Infinity;
        this.statistics = {
            enqueued: 0,
            dequeued: 0,
            rejected: 0,
            processed: 0,
            failed: 0,
            retried: 0,
            byPriority: {}
        };

        // Initialize priority stats
        for (const level in PriorityLevel) {
            this.statistics.byPriority[PriorityLevel[level]] = {
                enqueued: 0,
                processed: 0,
                avgWaitTime: 0,
                totalWaitTime: 0
            };
        }
    }

    enqueue(message) {
        if (this.heap.size() >= this.maxSize) {
            this.statistics.rejected++;
            throw new Error('Queue is full');
        }

        this.heap.push(message);
        this.statistics.enqueued++;
        this.statistics.byPriority[message.priority].enqueued++;

        return message.id;
    }

    dequeue() {
        const message = this.heap.pop();

        if (message) {
            this.statistics.dequeued++;
        }

        return message;
    }

    peek() {
        return this.heap.peek();
    }

    size() {
        return this.heap.size();
    }

    isEmpty() {
        return this.heap.isEmpty();
    }

    markProcessed(message, success = true) {
        message.markProcessed();

        if (success) {
            this.statistics.processed++;
            const priorityStats = this.statistics.byPriority[message.priority];
            priorityStats.processed++;
            priorityStats.totalWaitTime += message.getWaitTime();
            priorityStats.avgWaitTime = priorityStats.totalWaitTime / priorityStats.processed;
        } else {
            this.statistics.failed++;

            if (message.canRetry()) {
                message.incrementAttempts();
                this.enqueue(message);
                this.statistics.retried++;
            }
        }
    }

    clear() {
        this.heap.clear();
    }

    getStatistics() {
        return {
            ...this.statistics,
            currentSize: this.size(),
            maxSize: this.maxSize
        };
    }

    getAllMessages() {
        return this.heap.toArray();
    }
}

/**
 * Priority Queue Processor
 */
class QueueProcessor {
    constructor(queue, processorFn, options = {}) {
        this.queue = queue;
        this.processorFn = processorFn;
        this.concurrency = options.concurrency || 1;
        this.pollInterval = options.pollInterval || 100;
        this.isRunning = false;
        this.activeProcessors = 0;
        this.processingInterval = null;
    }

    start() {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        console.log(`Starting queue processor with concurrency: ${this.concurrency}`);

        this.processingInterval = setInterval(() => {
            this.processMessages();
        }, this.pollInterval);
    }

    stop() {
        this.isRunning = false;

        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }

        console.log('Queue processor stopped');
    }

    async processMessages() {
        while (this.isRunning &&
               this.activeProcessors < this.concurrency &&
               !this.queue.isEmpty()) {

            const message = this.queue.dequeue();
            if (!message) {
                break;
            }

            this.activeProcessors++;
            this.processMessage(message).finally(() => {
                this.activeProcessors--;
            });
        }
    }

    async processMessage(message) {
        try {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Processing timeout')), message.timeout)
            );

            const processingPromise = this.processorFn(message);

            await Promise.race([processingPromise, timeoutPromise]);

            this.queue.markProcessed(message, true);
        } catch (error) {
            console.error(`Error processing message ${message.id}:`, error.message);
            this.queue.markProcessed(message, false);
        }
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            activeProcessors: this.activeProcessors,
            concurrency: this.concurrency,
            queueSize: this.queue.size()
        };
    }
}

/**
 * Priority Queue Manager with multiple queues per priority
 */
class PriorityQueueManager {
    constructor(options = {}) {
        this.queues = new Map();
        this.processors = new Map();
        this.options = options;

        // Create a queue for each priority level
        for (const level in PriorityLevel) {
            const priority = PriorityLevel[level];
            this.queues.set(priority, new PriorityQueue(options));
        }
    }

    enqueue(message) {
        const queue = this.queues.get(message.priority);
        if (!queue) {
            throw new Error(`Invalid priority: ${message.priority}`);
        }

        return queue.enqueue(message);
    }

    startProcessing(processorFn, options = {}) {
        for (const [priority, queue] of this.queues) {
            const processor = new QueueProcessor(queue, processorFn, {
                ...options,
                // Higher concurrency for higher priority
                concurrency: options.baseConcurrency || 1 * (5 - priority)
            });

            processor.start();
            this.processors.set(priority, processor);
        }
    }

    stopProcessing() {
        for (const processor of this.processors.values()) {
            processor.stop();
        }
    }

    getAllStatistics() {
        const stats = {};

        for (const [priority, queue] of this.queues) {
            stats[priority] = queue.getStatistics();
        }

        return stats;
    }

    getTotalSize() {
        let total = 0;
        for (const queue of this.queues.values()) {
            total += queue.size();
        }
        return total;
    }
}

/**
 * Demonstration
 */
async function demonstratePriorityQueue() {
    console.log('=== Priority Queue Pattern Demonstration ===\n');

    // 1. Basic Priority Queue
    console.log('1. Basic Priority Queue:');
    const queue = new PriorityQueue({ maxSize: 100 });

    // Enqueue messages with different priorities
    queue.enqueue(new Message('msg1', { task: 'Regular task' }, PriorityLevel.MEDIUM));
    queue.enqueue(new Message('msg2', { task: 'Critical task' }, PriorityLevel.CRITICAL));
    queue.enqueue(new Message('msg3', { task: 'Background task' }, PriorityLevel.BACKGROUND));
    queue.enqueue(new Message('msg4', { task: 'High priority task' }, PriorityLevel.HIGH));
    queue.enqueue(new Message('msg5', { task: 'Another critical task' }, PriorityLevel.CRITICAL));

    console.log('\nDequeue order (by priority):');
    while (!queue.isEmpty()) {
        const msg = queue.dequeue();
        console.log(`  - ${msg.id}: ${msg.data.task} (Priority: ${msg.priority})`);
        queue.markProcessed(msg, true);
    }

    console.log('\nQueue statistics:');
    console.log(JSON.stringify(queue.getStatistics(), null, 2));

    // 2. Priority Queue with Processor
    console.log('\n2. Priority Queue with Processor:');
    const processQueue = new PriorityQueue();

    const processor = new QueueProcessor(
        processQueue,
        async (message) => {
            console.log(`Processing ${message.id}: ${message.data.task}`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate work
        },
        { concurrency: 2, pollInterval: 100 }
    );

    // Enqueue work items
    for (let i = 1; i <= 10; i++) {
        const priority = i <= 3 ? PriorityLevel.CRITICAL :
                        i <= 6 ? PriorityLevel.HIGH :
                        PriorityLevel.MEDIUM;

        processQueue.enqueue(new Message(
            `task_${i}`,
            { task: `Task ${i}` },
            priority
        ));
    }

    processor.start();

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 6000));

    processor.stop();

    console.log('\nProcessing statistics:');
    console.log(JSON.stringify(processQueue.getStatistics(), null, 2));

    // 3. Priority Queue Manager
    console.log('\n3. Priority Queue Manager (Multiple Queues):');
    const manager = new PriorityQueueManager({ maxSize: 50 });

    // Enqueue messages
    for (let i = 1; i <= 15; i++) {
        const priorities = Object.values(PriorityLevel);
        const priority = priorities[i % priorities.length];

        manager.enqueue(new Message(
            `item_${i}`,
            { work: `Work item ${i}` },
            priority
        ));
    }

    console.log(`Total messages enqueued: ${manager.getTotalSize()}`);

    // Start processing
    manager.startProcessing(async (message) => {
        console.log(`  Processing [P${message.priority}] ${message.id}`);
        await new Promise(resolve => setTimeout(resolve, 200));
    }, { baseConcurrency: 1 });

    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 5000));

    manager.stopProcessing();

    console.log('\nManager statistics:');
    console.log(JSON.stringify(manager.getAllStatistics(), null, 2));
}

// Run demonstration
if (require.main === module) {
    demonstratePriorityQueue().catch(console.error);
}

module.exports = {
    PriorityLevel,
    Message,
    MinHeap,
    PriorityQueue,
    QueueProcessor,
    PriorityQueueManager
};
