package Cloud.CompetingConsumers;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.time.Instant;
import java.time.Duration;

/**
 * CompetingConsumers Pattern Demonstration
 *
 * The Competing Consumers pattern enables multiple concurrent consumers to process
 * messages from the same message channel. This pattern improves scalability and
 * throughput by distributing work across multiple consumers.
 *
 * Key Components:
 * - Message Queue: Holds messages to be processed
 * - Consumers: Multiple workers competing for messages
 * - Message Router: Distributes messages to consumers
 * - Dead Letter Queue: Handles failed messages
 *
 * Cloud Resilience Features:
 * - Dynamic consumer scaling
 * - Message retry with exponential backoff
 * - Poison message handling
 * - Load balancing across consumers
 * - Consumer health monitoring
 * - Graceful shutdown
 * - Message priority handling
 */
public class Main {
    public static void main(String[] args) throws Exception {
        System.out.println("=== CompetingConsumers Pattern Demo ===\n");

        // Scenario 1: Basic competing consumers
        demonstrateBasicCompetingConsumers();

        // Scenario 2: Dynamic consumer scaling
        demonstrateDynamicScaling();

        // Scenario 3: Message retry mechanism
        demonstrateMessageRetry();

        // Scenario 4: Poison message handling
        demonstratePoisonMessageHandling();

        // Scenario 5: Priority-based processing
        demonstratePriorityProcessing();

        // Scenario 6: Load balancing strategies
        demonstrateLoadBalancing();

        // Scenario 7: Consumer health monitoring
        demonstrateHealthMonitoring();

        // Scenario 8: Graceful shutdown
        demonstrateGracefulShutdown();

        // Scenario 9: Batch message processing
        demonstrateBatchProcessing();

        // Scenario 10: Throughput optimization
        demonstrateThroughputOptimization();

        System.out.println("\nPattern demonstration complete.");
    }

    /**
     * Scenario 1: Basic competing consumers pattern
     * Demonstrates multiple consumers processing from same queue
     */
    private static void demonstrateBasicCompetingConsumers() throws Exception {
        System.out.println("--- Scenario 1: Basic Competing Consumers ---");

        MessageQueue queue = new MessageQueue();
        ConsumerPool pool = new ConsumerPool(3, queue);

        // Add messages
        for (int i = 1; i <= 10; i++) {
            queue.enqueue(new Message("MSG-" + i, "Order data " + i));
        }

        pool.start();
        Thread.sleep(2000);
        pool.shutdown();

        System.out.println("Messages processed: " + queue.getProcessedCount());
        System.out.println();
    }

    /**
     * Scenario 2: Dynamic consumer scaling based on queue depth
     * Demonstrates auto-scaling of consumers
     */
    private static void demonstrateDynamicScaling() throws Exception {
        System.out.println("--- Scenario 2: Dynamic Consumer Scaling ---");

        MessageQueue queue = new MessageQueue();
        ScalableConsumerPool pool = new ScalableConsumerPool(2, 5, queue);

        // Add burst of messages
        System.out.println("Adding 20 messages...");
        for (int i = 1; i <= 20; i++) {
            queue.enqueue(new Message("MSG-" + i, "Data " + i));
        }

        pool.start();
        Thread.sleep(1000);

        System.out.println("Active consumers: " + pool.getActiveConsumerCount());

        Thread.sleep(2000);
        pool.shutdown();

        System.out.println("Final consumers: " + pool.getActiveConsumerCount());
        System.out.println();
    }

    /**
     * Scenario 3: Message retry with exponential backoff
     * Demonstrates resilient message processing
     */
    private static void demonstrateMessageRetry() throws Exception {
        System.out.println("--- Scenario 3: Message Retry with Backoff ---");

        MessageQueue queue = new MessageQueue();
        queue.enableRetry(3, Duration.ofMillis(100));

        ConsumerPool pool = new ConsumerPool(2, queue);

        // Add message that will fail initially
        Message flakyMessage = new Message("FLAKY-1", "Data that fails initially");
        flakyMessage.setFailuresRemaining(2); // Fail 2 times then succeed
        queue.enqueue(flakyMessage);

        pool.start();
        Thread.sleep(1500);
        pool.shutdown();

        System.out.println();
    }

    /**
     * Scenario 4: Poison message handling with dead letter queue
     * Demonstrates handling of problematic messages
     */
    private static void demonstratePoisonMessageHandling() throws Exception {
        System.out.println("--- Scenario 4: Poison Message Handling ---");

        MessageQueue queue = new MessageQueue();
        queue.enableRetry(3, Duration.ofMillis(50));

        ConsumerPool pool = new ConsumerPool(2, queue);

        // Add normal and poison messages
        queue.enqueue(new Message("GOOD-1", "Valid data"));
        Message poisonMessage = new Message("POISON-1", "Corrupt data");
        poisonMessage.setPoison(true); // Will always fail
        queue.enqueue(poisonMessage);
        queue.enqueue(new Message("GOOD-2", "Valid data"));

        pool.start();
        Thread.sleep(1000);
        pool.shutdown();

        System.out.println("Dead letter queue size: " + queue.getDeadLetterQueueSize());
        System.out.println();
    }

    /**
     * Scenario 5: Priority-based message processing
     * Demonstrates processing high-priority messages first
     */
    private static void demonstratePriorityProcessing() throws Exception {
        System.out.println("--- Scenario 5: Priority-Based Processing ---");

        PriorityMessageQueue queue = new PriorityMessageQueue();
        ConsumerPool pool = new ConsumerPool(2, queue);

        // Add messages with different priorities
        queue.enqueue(new Message("LOW-1", "Low priority data", MessagePriority.LOW));
        queue.enqueue(new Message("HIGH-1", "High priority data", MessagePriority.HIGH));
        queue.enqueue(new Message("MEDIUM-1", "Medium priority data", MessagePriority.MEDIUM));
        queue.enqueue(new Message("HIGH-2", "High priority data", MessagePriority.HIGH));
        queue.enqueue(new Message("LOW-2", "Low priority data", MessagePriority.LOW));

        pool.start();
        Thread.sleep(1500);
        pool.shutdown();

        System.out.println();
    }

    /**
     * Scenario 6: Load balancing strategies
     * Demonstrates different message distribution approaches
     */
    private static void demonstrateLoadBalancing() throws Exception {
        System.out.println("--- Scenario 6: Load Balancing Strategies ---");

        MessageQueue queue = new MessageQueue();
        LoadBalancedConsumerPool pool = new LoadBalancedConsumerPool(3, queue);

        // Add varying complexity messages
        for (int i = 1; i <= 15; i++) {
            Message msg = new Message("MSG-" + i, "Data " + i);
            msg.setProcessingTime(50 + (i % 3) * 50); // Varying processing times
            queue.enqueue(msg);
        }

        pool.start();
        Thread.sleep(2000);
        pool.shutdown();

        pool.displayLoadStatistics();
        System.out.println();
    }

    /**
     * Scenario 7: Consumer health monitoring
     * Demonstrates tracking consumer health and performance
     */
    private static void demonstrateHealthMonitoring() throws Exception {
        System.out.println("--- Scenario 7: Consumer Health Monitoring ---");

        MessageQueue queue = new MessageQueue();
        MonitoredConsumerPool pool = new MonitoredConsumerPool(3, queue);

        // Add messages
        for (int i = 1; i <= 12; i++) {
            queue.enqueue(new Message("MSG-" + i, "Data " + i));
        }

        pool.start();
        Thread.sleep(1500);

        pool.displayHealthMetrics();

        pool.shutdown();
        System.out.println();
    }

    /**
     * Scenario 8: Graceful shutdown with message completion
     * Demonstrates proper cleanup and message handling
     */
    private static void demonstrateGracefulShutdown() throws Exception {
        System.out.println("--- Scenario 8: Graceful Shutdown ---");

        MessageQueue queue = new MessageQueue();
        ConsumerPool pool = new ConsumerPool(3, queue);

        // Add long-running messages
        for (int i = 1; i <= 5; i++) {
            Message msg = new Message("LONG-" + i, "Long task " + i);
            msg.setProcessingTime(500);
            queue.enqueue(msg);
        }

        pool.start();
        Thread.sleep(500);

        System.out.println("Initiating graceful shutdown...");
        pool.gracefulShutdown(Duration.ofSeconds(3));

        System.out.println("Shutdown complete. Processed: " + queue.getProcessedCount());
        System.out.println();
    }

    /**
     * Scenario 9: Batch message processing
     * Demonstrates efficient batch operations
     */
    private static void demonstrateBatchProcessing() throws Exception {
        System.out.println("--- Scenario 9: Batch Message Processing ---");

        MessageQueue queue = new MessageQueue();
        BatchConsumerPool pool = new BatchConsumerPool(2, queue, 3);

        // Add messages
        for (int i = 1; i <= 10; i++) {
            queue.enqueue(new Message("MSG-" + i, "Data " + i));
        }

        pool.start();
        Thread.sleep(2000);
        pool.shutdown();

        System.out.println("Batches processed: " + pool.getBatchCount());
        System.out.println();
    }

    /**
     * Scenario 10: Throughput optimization
     * Demonstrates maximizing message processing rate
     */
    private static void demonstrateThroughputOptimization() throws Exception {
        System.out.println("--- Scenario 10: Throughput Optimization ---");

        MessageQueue queue = new MessageQueue();
        OptimizedConsumerPool pool = new OptimizedConsumerPool(4, queue);

        Instant start = Instant.now();

        // Add many messages
        for (int i = 1; i <= 100; i++) {
            queue.enqueue(new Message("MSG-" + i, "Data " + i));
        }

        pool.start();

        // Wait for completion
        while (queue.size() > 0 || queue.getProcessedCount() < 100) {
            Thread.sleep(100);
        }

        Instant end = Instant.now();
        long durationMs = Duration.between(start, end).toMillis();

        pool.shutdown();

        System.out.println("Processed 100 messages in " + durationMs + "ms");
        System.out.println("Throughput: " + String.format("%.2f", 100000.0 / durationMs) + " msg/sec");
        System.out.println();
    }
}

/**
 * Message priority enumeration
 */
enum MessagePriority {
    LOW(3),
    MEDIUM(2),
    HIGH(1);

    private int value;

    MessagePriority(int value) {
        this.value = value;
    }

    public int getValue() { return value; }
}

/**
 * Message class
 */
class Message implements Comparable<Message> {
    private String id;
    private String data;
    private MessagePriority priority;
    private int retryCount;
    private int failuresRemaining;
    private boolean poison;
    private long processingTime;
    private Instant timestamp;

    public Message(String id, String data) {
        this(id, data, MessagePriority.MEDIUM);
    }

    public Message(String id, String data, MessagePriority priority) {
        this.id = id;
        this.data = data;
        this.priority = priority;
        this.retryCount = 0;
        this.failuresRemaining = 0;
        this.poison = false;
        this.processingTime = 100;
        this.timestamp = Instant.now();
    }

    public String getId() { return id; }
    public String getData() { return data; }
    public MessagePriority getPriority() { return priority; }
    public int getRetryCount() { return retryCount; }
    public void incrementRetry() { retryCount++; }
    public int getFailuresRemaining() { return failuresRemaining; }
    public void setFailuresRemaining(int failures) { this.failuresRemaining = failures; }
    public void decrementFailures() { if (failuresRemaining > 0) failuresRemaining--; }
    public boolean isPoison() { return poison; }
    public void setPoison(boolean poison) { this.poison = poison; }
    public long getProcessingTime() { return processingTime; }
    public void setProcessingTime(long ms) { this.processingTime = ms; }
    public Instant getTimestamp() { return timestamp; }

    @Override
    public int compareTo(Message other) {
        return Integer.compare(this.priority.getValue(), other.priority.getValue());
    }
}

/**
 * Message queue
 */
class MessageQueue {
    protected BlockingQueue<Message> queue;
    protected List<Message> deadLetterQueue;
    protected AtomicInteger processedCount;
    protected boolean retryEnabled;
    protected int maxRetries;
    protected Duration retryDelay;

    public MessageQueue() {
        this.queue = new LinkedBlockingQueue<>();
        this.deadLetterQueue = new CopyOnWriteArrayList<>();
        this.processedCount = new AtomicInteger(0);
        this.retryEnabled = false;
        this.maxRetries = 3;
        this.retryDelay = Duration.ofMillis(100);
    }

    public void enqueue(Message message) {
        queue.offer(message);
    }

    public Message dequeue() throws InterruptedException {
        return queue.poll(100, TimeUnit.MILLISECONDS);
    }

    public void markProcessed(Message message) {
        processedCount.incrementAndGet();
    }

    public void requeueForRetry(Message message) {
        if (retryEnabled && message.getRetryCount() < maxRetries) {
            message.incrementRetry();
            queue.offer(message);
            System.out.println("  [QUEUE] Requeued " + message.getId() + " (retry " + message.getRetryCount() + ")");
        } else {
            deadLetterQueue.add(message);
            System.out.println("  [QUEUE] Moved " + message.getId() + " to dead letter queue");
        }
    }

    public void enableRetry(int maxRetries, Duration retryDelay) {
        this.retryEnabled = true;
        this.maxRetries = maxRetries;
        this.retryDelay = retryDelay;
    }

    public int size() {
        return queue.size();
    }

    public int getProcessedCount() {
        return processedCount.get();
    }

    public int getDeadLetterQueueSize() {
        return deadLetterQueue.size();
    }

    public List<Message> getDeadLetterQueue() {
        return new ArrayList<>(deadLetterQueue);
    }
}

/**
 * Priority message queue
 */
class PriorityMessageQueue extends MessageQueue {
    public PriorityMessageQueue() {
        this.queue = new PriorityBlockingQueue<>();
        this.deadLetterQueue = new CopyOnWriteArrayList<>();
        this.processedCount = new AtomicInteger(0);
    }
}

/**
 * Message consumer
 */
class MessageConsumer implements Runnable {
    private String id;
    private MessageQueue queue;
    private volatile boolean running;
    private AtomicInteger messagesProcessed;
    private AtomicLong totalProcessingTime;

    public MessageConsumer(String id, MessageQueue queue) {
        this.id = id;
        this.queue = queue;
        this.running = true;
        this.messagesProcessed = new AtomicInteger(0);
        this.totalProcessingTime = new AtomicLong(0);
    }

    @Override
    public void run() {
        System.out.println("  [" + id + "] Started");

        while (running) {
            try {
                Message message = queue.dequeue();
                if (message != null) {
                    processMessage(message);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        System.out.println("  [" + id + "] Stopped");
    }

    protected void processMessage(Message message) {
        long start = System.currentTimeMillis();

        try {
            System.out.println("  [" + id + "] Processing " + message.getId());

            // Simulate processing
            Thread.sleep(message.getProcessingTime());

            // Simulate failures
            if (message.getFailuresRemaining() > 0) {
                message.decrementFailures();
                throw new RuntimeException("Simulated failure");
            }

            if (message.isPoison()) {
                throw new RuntimeException("Poison message");
            }

            queue.markProcessed(message);
            messagesProcessed.incrementAndGet();

            long duration = System.currentTimeMillis() - start;
            totalProcessingTime.addAndGet(duration);

        } catch (Exception e) {
            System.out.println("  [" + id + "] Failed to process " + message.getId() + ": " + e.getMessage());
            queue.requeueForRetry(message);
        }
    }

    public void stop() {
        running = false;
    }

    public boolean isRunning() {
        return running;
    }

    public String getId() {
        return id;
    }

    public int getMessagesProcessed() {
        return messagesProcessed.get();
    }

    public long getAverageProcessingTime() {
        int count = messagesProcessed.get();
        return count > 0 ? totalProcessingTime.get() / count : 0;
    }
}

/**
 * Consumer pool managing multiple consumers
 */
class ConsumerPool {
    protected List<MessageConsumer> consumers;
    protected List<Thread> threads;
    protected MessageQueue queue;
    protected int consumerCount;

    public ConsumerPool(int consumerCount, MessageQueue queue) {
        this.consumerCount = consumerCount;
        this.queue = queue;
        this.consumers = new ArrayList<>();
        this.threads = new ArrayList<>();
    }

    public void start() {
        System.out.println("  [POOL] Starting " + consumerCount + " consumers");

        for (int i = 0; i < consumerCount; i++) {
            MessageConsumer consumer = createConsumer("Consumer-" + (i + 1));
            Thread thread = new Thread(consumer);
            consumers.add(consumer);
            threads.add(thread);
            thread.start();
        }
    }

    protected MessageConsumer createConsumer(String id) {
        return new MessageConsumer(id, queue);
    }

    public void shutdown() {
        System.out.println("  [POOL] Shutting down consumers");

        for (MessageConsumer consumer : consumers) {
            consumer.stop();
        }

        for (Thread thread : threads) {
            try {
                thread.join(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    public void gracefulShutdown(Duration timeout) throws InterruptedException {
        System.out.println("  [POOL] Graceful shutdown initiated (timeout: " + timeout.getSeconds() + "s)");

        Instant deadline = Instant.now().plus(timeout);

        for (MessageConsumer consumer : consumers) {
            consumer.stop();
        }

        // Wait for threads to finish with timeout
        for (Thread thread : threads) {
            long remainingMs = Duration.between(Instant.now(), deadline).toMillis();
            if (remainingMs > 0) {
                thread.join(remainingMs);
            }
        }
    }

    public int getActiveConsumerCount() {
        return (int) consumers.stream().filter(MessageConsumer::isRunning).count();
    }
}

/**
 * Scalable consumer pool with dynamic sizing
 */
class ScalableConsumerPool extends ConsumerPool {
    private int minConsumers;
    private int maxConsumers;
    private ScheduledExecutorService scaler;

    public ScalableConsumerPool(int minConsumers, int maxConsumers, MessageQueue queue) {
        super(minConsumers, queue);
        this.minConsumers = minConsumers;
        this.maxConsumers = maxConsumers;
        this.scaler = Executors.newSingleThreadScheduledExecutor();
    }

    @Override
    public void start() {
        super.start();

        // Start auto-scaling
        scaler.scheduleAtFixedRate(() -> {
            int queueSize = queue.size();
            int activeConsumers = getActiveConsumerCount();

            if (queueSize > 10 && activeConsumers < maxConsumers) {
                scaleUp();
            } else if (queueSize < 3 && activeConsumers > minConsumers) {
                scaleDown();
            }
        }, 500, 500, TimeUnit.MILLISECONDS);
    }

    private synchronized void scaleUp() {
        if (consumers.size() < maxConsumers) {
            System.out.println("  [SCALER] Scaling up to " + (consumers.size() + 1) + " consumers");
            MessageConsumer consumer = createConsumer("Consumer-" + (consumers.size() + 1));
            Thread thread = new Thread(consumer);
            consumers.add(consumer);
            threads.add(thread);
            thread.start();
        }
    }

    private synchronized void scaleDown() {
        if (consumers.size() > minConsumers) {
            System.out.println("  [SCALER] Scaling down to " + (consumers.size() - 1) + " consumers");
            MessageConsumer consumer = consumers.remove(consumers.size() - 1);
            consumer.stop();
        }
    }

    @Override
    public void shutdown() {
        scaler.shutdown();
        super.shutdown();
    }
}

/**
 * Load-balanced consumer pool
 */
class LoadBalancedConsumerPool extends ConsumerPool {
    public LoadBalancedConsumerPool(int consumerCount, MessageQueue queue) {
        super(consumerCount, queue);
    }

    public void displayLoadStatistics() {
        System.out.println("  Load Statistics:");
        for (MessageConsumer consumer : consumers) {
            System.out.println("    " + consumer.getId() + ": " +
                consumer.getMessagesProcessed() + " messages, " +
                "avg " + consumer.getAverageProcessingTime() + "ms");
        }
    }
}

/**
 * Monitored consumer pool with health metrics
 */
class MonitoredConsumerPool extends ConsumerPool {
    public MonitoredConsumerPool(int consumerCount, MessageQueue queue) {
        super(consumerCount, queue);
    }

    public void displayHealthMetrics() {
        System.out.println("  Health Metrics:");
        int totalMessages = consumers.stream()
            .mapToInt(MessageConsumer::getMessagesProcessed)
            .sum();

        System.out.println("    Total messages processed: " + totalMessages);
        System.out.println("    Active consumers: " + getActiveConsumerCount() + "/" + consumers.size());
        System.out.println("    Queue depth: " + queue.size());
        System.out.println("    Dead letter queue: " + queue.getDeadLetterQueueSize());
    }
}

/**
 * Batch consumer pool
 */
class BatchConsumerPool extends ConsumerPool {
    private int batchSize;
    private AtomicInteger batchCount;

    public BatchConsumerPool(int consumerCount, MessageQueue queue, int batchSize) {
        super(consumerCount, queue);
        this.batchSize = batchSize;
        this.batchCount = new AtomicInteger(0);
    }

    @Override
    protected MessageConsumer createConsumer(String id) {
        return new BatchConsumer(id, queue, batchSize, batchCount);
    }

    public int getBatchCount() {
        return batchCount.get();
    }
}

/**
 * Batch message consumer
 */
class BatchConsumer extends MessageConsumer {
    private int batchSize;
    private AtomicInteger batchCount;

    public BatchConsumer(String id, MessageQueue queue, int batchSize, AtomicInteger batchCount) {
        super(id, queue);
        this.batchSize = batchSize;
        this.batchCount = batchCount;
    }

    @Override
    public void run() {
        System.out.println("  [" + getId() + "] Started (batch size: " + batchSize + ")");

        while (isRunning()) {
            try {
                List<Message> batch = new ArrayList<>();

                // Collect batch
                for (int i = 0; i < batchSize; i++) {
                    Message message = queue.dequeue();
                    if (message != null) {
                        batch.add(message);
                    } else {
                        break;
                    }
                }

                if (!batch.isEmpty()) {
                    processBatch(batch);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        System.out.println("  [" + getId() + "] Stopped");
    }

    private void processBatch(List<Message> batch) {
        System.out.println("  [" + getId() + "] Processing batch of " + batch.size() + " messages");

        for (Message message : batch) {
            processMessage(message);
        }

        batchCount.incrementAndGet();
    }
}

/**
 * Optimized consumer pool for maximum throughput
 */
class OptimizedConsumerPool extends ConsumerPool {
    public OptimizedConsumerPool(int consumerCount, MessageQueue queue) {
        super(consumerCount, queue);
    }

    @Override
    protected MessageConsumer createConsumer(String id) {
        return new OptimizedConsumer(id, queue);
    }
}

/**
 * Optimized consumer with minimal overhead
 */
class OptimizedConsumer extends MessageConsumer {
    public OptimizedConsumer(String id, MessageQueue queue) {
        super(id, queue);
    }

    @Override
    protected void processMessage(Message message) {
        try {
            // Fast processing without excessive logging
            Thread.sleep(message.getProcessingTime());
            queue.markProcessed(message);
        } catch (Exception e) {
            queue.requeueForRetry(message);
        }
    }
}
