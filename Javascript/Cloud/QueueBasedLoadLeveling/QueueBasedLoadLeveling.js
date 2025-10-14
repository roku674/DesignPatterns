/**
 * Queue-Based Load Leveling Pattern Implementation
 *
 * Queue-Based Load Leveling uses a queue as a buffer between a task producer and consumer
 * to smooth out intermittent heavy loads and prevent overwhelming the service.
 *
 * Key Components:
 * - Task Queue: Buffer for incoming tasks
 * - Rate Limiter: Controls processing rate
 * - Worker Pool: Processes tasks at controlled rate
 * - Load Monitor: Monitors queue and system load
 * - Scaling Strategy: Auto-scales workers based on load
 */

/**
 * Task representation
 */
class Task {
    constructor(id, data, options = {}) {
        this.id = id;
        this.data = data;
        this.priority = options.priority || 5;
        this.createdAt = Date.now();
        this.startedAt = null;
        this.completedAt = null;
        this.attempts = 0;
        this.maxRetries = options.maxRetries || 3;
        this.status = 'pending'; // pending, processing, completed, failed
    }

    start() {
        this.startedAt = Date.now();
        this.status = 'processing';
        this.attempts++;
    }

    complete() {
        this.completedAt = Date.now();
        this.status = 'completed';
    }

    fail() {
        this.status = 'failed';
    }

    getWaitTime() {
        return this.startedAt ? this.startedAt - this.createdAt : Date.now() - this.createdAt;
    }

    getProcessingTime() {
        return this.completedAt && this.startedAt ? this.completedAt - this.startedAt : null;
    }

    canRetry() {
        return this.attempts < this.maxRetries;
    }
}

/**
 * Load Leveling Queue
 */
class LoadLevelingQueue {
    constructor(options = {}) {
        this.maxSize = options.maxSize || 1000;
        this.queue = [];
        this.statistics = {
            enqueued: 0,
            dequeued: 0,
            rejected: 0,
            completed: 0,
            failed: 0,
            totalWaitTime: 0,
            totalProcessingTime: 0
        };
    }

    enqueue(task) {
        if (this.queue.length >= this.maxSize) {
            this.statistics.rejected++;
            throw new Error('Queue is full');
        }

        this.queue.push(task);
        this.statistics.enqueued++;
        return task.id;
    }

    dequeue() {
        if (this.queue.length === 0) {
            return null;
        }

        const task = this.queue.shift();
        this.statistics.dequeued++;
        return task;
    }

    peek() {
        return this.queue[0];
    }

    size() {
        return this.queue.length;
    }

    isEmpty() {
        return this.queue.length === 0;
    }

    recordCompletion(task, success = true) {
        if (success) {
            this.statistics.completed++;
            this.statistics.totalWaitTime += task.getWaitTime();
            const processingTime = task.getProcessingTime();
            if (processingTime) {
                this.statistics.totalProcessingTime += processingTime;
            }
        } else {
            this.statistics.failed++;
        }
    }

    getStatistics() {
        const avgWaitTime = this.statistics.completed > 0 ?
            this.statistics.totalWaitTime / this.statistics.completed : 0;

        const avgProcessingTime = this.statistics.completed > 0 ?
            this.statistics.totalProcessingTime / this.statistics.completed : 0;

        return {
            ...this.statistics,
            currentSize: this.size(),
            maxSize: this.maxSize,
            avgWaitTime: Math.round(avgWaitTime),
            avgProcessingTime: Math.round(avgProcessingTime)
        };
    }

    clear() {
        this.queue = [];
    }
}

/**
 * Rate Limiter - Controls processing rate
 */
class RateLimiter {
    constructor(maxRate, timeWindow = 1000) {
        this.maxRate = maxRate; // max operations per time window
        this.timeWindow = timeWindow; // time window in ms
        this.tokens = maxRate;
        this.lastRefill = Date.now();
    }

    canProcess() {
        this.refillTokens();
        return this.tokens > 0;
    }

    consume() {
        if (!this.canProcess()) {
            return false;
        }

        this.tokens--;
        return true;
    }

    refillTokens() {
        const now = Date.now();
        const timePassed = now - this.lastRefill;

        if (timePassed >= this.timeWindow) {
            const intervalsElapsed = Math.floor(timePassed / this.timeWindow);
            this.tokens = Math.min(this.maxRate, this.tokens + (intervalsElapsed * this.maxRate));
            this.lastRefill = now;
        }
    }

    getAvailableTokens() {
        this.refillTokens();
        return this.tokens;
    }
}

/**
 * Worker - Processes tasks
 */
class Worker {
    constructor(id, processorFn, rateLimiter) {
        this.id = id;
        this.processorFn = processorFn;
        this.rateLimiter = rateLimiter;
        this.isProcessing = false;
        this.currentTask = null;
        this.processedCount = 0;
    }

    async processTask(task) {
        // Wait for rate limiter
        while (!this.rateLimiter.consume()) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        this.isProcessing = true;
        this.currentTask = task;

        try {
            task.start();
            await this.processorFn(task);
            task.complete();
            this.processedCount++;
            return true;
        } catch (error) {
            console.error(`Worker ${this.id} failed to process task ${task.id}:`, error.message);
            task.fail();
            return false;
        } finally {
            this.isProcessing = false;
            this.currentTask = null;
        }
    }

    getStatus() {
        return {
            id: this.id,
            isProcessing: this.isProcessing,
            currentTask: this.currentTask?.id || null,
            processedCount: this.processedCount
        };
    }
}

/**
 * Worker Pool - Manages multiple workers
 */
class WorkerPool {
    constructor(size, processorFn, rateLimiter) {
        this.workers = [];
        this.processorFn = processorFn;
        this.rateLimiter = rateLimiter;

        for (let i = 0; i < size; i++) {
            this.workers.push(new Worker(i, processorFn, rateLimiter));
        }
    }

    getAvailableWorker() {
        return this.workers.find(w => !w.isProcessing);
    }

    getAllWorkerStatus() {
        return this.workers.map(w => w.getStatus());
    }

    getActiveCount() {
        return this.workers.filter(w => w.isProcessing).length;
    }

    getTotalProcessed() {
        return this.workers.reduce((sum, w) => sum + w.processedCount, 0);
    }

    addWorker() {
        const newId = this.workers.length;
        const worker = new Worker(newId, this.processorFn, this.rateLimiter);
        this.workers.push(worker);
        return worker;
    }

    removeWorker() {
        // Remove idle worker
        const idleWorker = this.workers.find(w => !w.isProcessing);
        if (idleWorker) {
            const index = this.workers.indexOf(idleWorker);
            this.workers.splice(index, 1);
            return true;
        }
        return false;
    }

    size() {
        return this.workers.length;
    }
}

/**
 * Load Monitor - Monitors system load
 */
class LoadMonitor {
    constructor(queue, workerPool) {
        this.queue = queue;
        this.workerPool = workerPool;
        this.history = [];
        this.maxHistory = 100;
    }

    recordMetrics() {
        const metrics = {
            timestamp: Date.now(),
            queueSize: this.queue.size(),
            activeWorkers: this.workerPool.getActiveCount(),
            totalWorkers: this.workerPool.size(),
            utilization: this.workerPool.getActiveCount() / this.workerPool.size()
        };

        this.history.push(metrics);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }

        return metrics;
    }

    getAverageMetrics(lookback = 10) {
        const recentMetrics = this.history.slice(-lookback);

        if (recentMetrics.length === 0) {
            return null;
        }

        return {
            avgQueueSize: recentMetrics.reduce((sum, m) => sum + m.queueSize, 0) / recentMetrics.length,
            avgUtilization: recentMetrics.reduce((sum, m) => sum + m.utilization, 0) / recentMetrics.length,
            avgActiveWorkers: recentMetrics.reduce((sum, m) => sum + m.activeWorkers, 0) / recentMetrics.length
        };
    }

    shouldScaleUp() {
        const avg = this.getAverageMetrics(5);
        if (!avg) return false;

        // Scale up if queue is growing and workers are busy
        return avg.avgQueueSize > 10 && avg.avgUtilization > 0.8;
    }

    shouldScaleDown() {
        const avg = this.getAverageMetrics(10);
        if (!avg) return false;

        // Scale down if queue is small and workers are idle
        return avg.avgQueueSize < 5 && avg.avgUtilization < 0.3;
    }
}

/**
 * Queue-Based Load Leveling System
 */
class QueueBasedLoadLevelingSystem {
    constructor(options = {}) {
        this.queue = new LoadLevelingQueue({
            maxSize: options.maxQueueSize || 1000
        });

        this.rateLimiter = new RateLimiter(
            options.maxRate || 10,
            options.rateWindow || 1000
        );

        this.workerPool = new WorkerPool(
            options.initialWorkers || 3,
            options.processorFn || this.defaultProcessor,
            this.rateLimiter
        );

        this.loadMonitor = new LoadMonitor(this.queue, this.workerPool);

        this.isRunning = false;
        this.processingInterval = null;
        this.monitoringInterval = null;

        this.options = {
            autoScale: options.autoScale !== false,
            minWorkers: options.minWorkers || 1,
            maxWorkers: options.maxWorkers || 10,
            monitorInterval: options.monitorInterval || 1000,
            processInterval: options.processInterval || 100
        };
    }

    async defaultProcessor(task) {
        // Default no-op processor
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    submitTask(task) {
        return this.queue.enqueue(task);
    }

    start() {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        console.log('Starting Queue-Based Load Leveling System...');

        // Start processing loop
        this.processingInterval = setInterval(() => {
            this.processNextTasks();
        }, this.options.processInterval);

        // Start monitoring loop
        if (this.options.autoScale) {
            this.monitoringInterval = setInterval(() => {
                this.monitor();
            }, this.options.monitorInterval);
        }
    }

    stop() {
        this.isRunning = false;

        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }

        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        console.log('Queue-Based Load Leveling System stopped');
    }

    async processNextTasks() {
        while (this.isRunning && !this.queue.isEmpty()) {
            const worker = this.workerPool.getAvailableWorker();
            if (!worker) {
                break;
            }

            const task = this.queue.dequeue();
            if (!task) {
                break;
            }

            // Process task without blocking
            worker.processTask(task).then(success => {
                this.queue.recordCompletion(task, success);

                if (!success && task.canRetry()) {
                    this.queue.enqueue(task);
                }
            }).catch(error => {
                console.error('Error processing task:', error);
            });
        }
    }

    monitor() {
        const metrics = this.loadMonitor.recordMetrics();

        if (this.options.autoScale) {
            if (this.loadMonitor.shouldScaleUp() && this.workerPool.size() < this.options.maxWorkers) {
                this.workerPool.addWorker();
                console.log(`Scaled up to ${this.workerPool.size()} workers`);
            } else if (this.loadMonitor.shouldScaleDown() && this.workerPool.size() > this.options.minWorkers) {
                this.workerPool.removeWorker();
                console.log(`Scaled down to ${this.workerPool.size()} workers`);
            }
        }

        return metrics;
    }

    getSystemStatus() {
        return {
            isRunning: this.isRunning,
            queue: this.queue.getStatistics(),
            workers: {
                total: this.workerPool.size(),
                active: this.workerPool.getActiveCount(),
                processed: this.workerPool.getTotalProcessed()
            },
            rateLimiter: {
                availableTokens: this.rateLimiter.getAvailableTokens(),
                maxRate: this.rateLimiter.maxRate
            },
            loadMetrics: this.loadMonitor.getAverageMetrics(10)
        };
    }
}

/**
 * Demonstration
 */
async function demonstrateQueueBasedLoadLeveling() {
    console.log('=== Queue-Based Load Leveling Pattern Demonstration ===\n');

    // 1. Basic Load Leveling
    console.log('1. Basic Load Leveling with Rate Limiting:');

    const system = new QueueBasedLoadLevelingSystem({
        initialWorkers: 2,
        maxRate: 5,
        rateWindow: 1000,
        maxQueueSize: 100,
        autoScale: true,
        minWorkers: 1,
        maxWorkers: 5,
        processorFn: async (task) => {
            console.log(`  Processing task ${task.id}: ${task.data.operation}`);
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
        }
    });

    system.start();

    // Submit burst of tasks
    console.log('\n2. Submitting burst of 20 tasks...');
    for (let i = 1; i <= 20; i++) {
        const task = new Task(`task_${i}`, {
            operation: `Operation ${i}`,
            payload: `Data for task ${i}`
        });

        try {
            system.submitTask(task);
        } catch (error) {
            console.log(`Task ${i} rejected: ${error.message}`);
        }
    }

    // Monitor progress
    console.log('\n3. Monitoring system status:');

    for (let i = 0; i < 6; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const status = system.getSystemStatus();
        console.log(`\nT+${(i + 1) * 2}s:`);
        console.log(`  Queue size: ${status.queue.currentSize}`);
        console.log(`  Workers: ${status.workers.active}/${status.workers.total}`);
        console.log(`  Processed: ${status.workers.processed}`);
        console.log(`  Rate limit tokens: ${status.rateLimiter.availableTokens}`);

        if (status.loadMetrics) {
            console.log(`  Avg utilization: ${(status.loadMetrics.avgUtilization * 100).toFixed(1)}%`);
        }
    }

    // Final statistics
    console.log('\n4. Final System Statistics:');
    const finalStatus = system.getSystemStatus();
    console.log(JSON.stringify(finalStatus, null, 2));

    system.stop();

    console.log('\n5. Demonstrating spike handling:');
    const spikeSystem = new QueueBasedLoadLevelingSystem({
        initialWorkers: 1,
        maxRate: 10,
        autoScale: true,
        maxWorkers: 4,
        processorFn: async (task) => {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    });

    spikeSystem.start();

    // Simulate traffic spike
    for (let i = 1; i <= 30; i++) {
        spikeSystem.submitTask(new Task(`spike_${i}`, { work: i }));
    }

    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\nSpike handling statistics:');
    console.log(JSON.stringify(spikeSystem.getSystemStatus().queue, null, 2));

    spikeSystem.stop();
}

// Run demonstration
if (require.main === module) {
    demonstrateQueueBasedLoadLeveling().catch(console.error);
}

module.exports = {
    Task,
    LoadLevelingQueue,
    RateLimiter,
    Worker,
    WorkerPool,
    LoadMonitor,
    QueueBasedLoadLevelingSystem
};
