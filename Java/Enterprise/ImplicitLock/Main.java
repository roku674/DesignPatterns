package Enterprise.ImplicitLock;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.locks.*;

/**
 * Implicit Lock Pattern Demonstration
 *
 * Intent: Manages locks implicitly without explicit lock calls by leveraging
 * Java's synchronized keyword, monitors, and concurrent collections. This pattern
 * simplifies code by hiding lock management details.
 *
 * Key Concepts:
 * - Uses Java's built-in synchronization mechanisms
 * - Locks are acquired and released automatically
 * - Reduces risk of forgetting to unlock
 * - Monitor pattern for encapsulation
 * - Thread-safe collections handle locking internally
 *
 * Real-world examples:
 * - Thread-safe counters and statistics
 * - Synchronized caches
 * - Connection pools
 * - Message queues
 * - Event listeners
 *
 * Database Schema Examples:
 *
 * CREATE TABLE connection_pool (
 *     connection_id BIGINT PRIMARY KEY,
 *     database_url VARCHAR(500),
 *     in_use BOOLEAN,
 *     checked_out_at TIMESTAMP,
 *     checked_out_by VARCHAR(100)
 * );
 *
 * CREATE TABLE message_queue (
 *     message_id BIGINT PRIMARY KEY,
 *     topic VARCHAR(255),
 *     payload TEXT,
 *     created_at TIMESTAMP,
 *     processed BOOLEAN
 * );
 */
public class Main {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== Implicit Lock Pattern Demo ===\n");

        // Scenario 1: Thread-Safe Counter
        demonstrateThreadSafeCounter();

        // Scenario 2: Synchronized Cache
        demonstrateSynchronizedCache();

        // Scenario 3: Connection Pool
        demonstrateConnectionPool();

        // Scenario 4: Message Queue
        demonstrateMessageQueue();

        // Scenario 5: Event Listener Registry
        demonstrateEventListenerRegistry();

        // Scenario 6: Thread-Safe Statistics
        demonstrateThreadSafeStatistics();

        // Scenario 7: Blocking Queue Operations
        demonstrateBlockingQueue();

        // Scenario 8: Concurrent Map Operations
        demonstrateConcurrentMap();

        // Scenario 9: Synchronized Collection Wrapper
        demonstrateSynchronizedCollections();

        // Scenario 10: Monitor Pattern for Complex Objects
        demonstrateMonitorPattern();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    /**
     * Scenario 1: Thread-safe counter using synchronized methods
     */
    private static void demonstrateThreadSafeCounter() throws InterruptedException {
        System.out.println("--- Scenario 1: Thread-Safe Counter ---");

        ThreadSafeCounter counter = new ThreadSafeCounter();

        ExecutorService executor = Executors.newFixedThreadPool(5);

        // Multiple threads incrementing counter
        for (int i = 0; i < 10; i++) {
            executor.submit(() -> {
                for (int j = 0; j < 100; j++) {
                    counter.increment();
                }
            });
        }

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("Final count: " + counter.getCount());
        System.out.println("Expected: 1000");
        System.out.println();
    }

    /**
     * Scenario 2: Synchronized cache with automatic lock management
     */
    private static void demonstrateSynchronizedCache() throws InterruptedException {
        System.out.println("--- Scenario 2: Synchronized Cache ---");

        SynchronizedCache<String, String> cache = new SynchronizedCache<>();

        ExecutorService executor = Executors.newFixedThreadPool(3);

        // Multiple threads reading and writing
        executor.submit(() -> {
            cache.put("user:1", "Alice");
            cache.put("user:2", "Bob");
            System.out.println("  Thread 1: Added users");
        });

        executor.submit(() -> {
            cache.put("user:3", "Carol");
            String user = cache.get("user:1");
            System.out.println("  Thread 2: Retrieved " + user);
        });

        executor.submit(() -> {
            int size = cache.size();
            System.out.println("  Thread 3: Cache size = " + size);
        });

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("Final cache size: " + cache.size());
        System.out.println();
    }

    /**
     * Scenario 3: Connection pool with implicit locking
     */
    private static void demonstrateConnectionPool() throws InterruptedException {
        System.out.println("--- Scenario 3: Connection Pool ---");

        ConnectionPool pool = new ConnectionPool(3);

        ExecutorService executor = Executors.newFixedThreadPool(5);

        // Multiple threads trying to get connections
        for (int i = 1; i <= 5; i++) {
            int threadNum = i;
            executor.submit(() -> {
                try {
                    Connection conn = pool.getConnection();
                    System.out.println("  Thread-" + threadNum + " got connection: " + conn.getId());
                    Thread.sleep(100);
                    pool.releaseConnection(conn);
                    System.out.println("  Thread-" + threadNum + " released connection");
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }

        executor.shutdown();
        executor.awaitTermination(10, TimeUnit.SECONDS);

        System.out.println("Available connections: " + pool.getAvailableCount());
        System.out.println();
    }

    /**
     * Scenario 4: Message queue with blocking operations
     */
    private static void demonstrateMessageQueue() throws InterruptedException {
        System.out.println("--- Scenario 4: Message Queue ---");

        MessageQueue queue = new MessageQueue();

        ExecutorService executor = Executors.newFixedThreadPool(4);

        // Producer threads
        executor.submit(() -> {
            try {
                for (int i = 1; i <= 5; i++) {
                    queue.enqueue(new Message("MSG-" + i, "Content " + i));
                    System.out.println("  Producer 1: Enqueued MSG-" + i);
                    Thread.sleep(50);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        // Consumer threads
        for (int i = 1; i <= 3; i++) {
            int consumerNum = i;
            executor.submit(() -> {
                try {
                    Thread.sleep(100); // Let some messages queue up
                    Message msg = queue.dequeue();
                    System.out.println("  Consumer " + consumerNum + ": Dequeued " + msg.getId());
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("Remaining messages: " + queue.size());
        System.out.println();
    }

    /**
     * Scenario 5: Event listener registry with synchronized access
     */
    private static void demonstrateEventListenerRegistry() throws InterruptedException {
        System.out.println("--- Scenario 5: Event Listener Registry ---");

        EventListenerRegistry registry = new EventListenerRegistry();

        ExecutorService executor = Executors.newFixedThreadPool(3);

        // Register listeners
        executor.submit(() -> {
            registry.addListener("userCreated", event ->
                System.out.println("  Listener 1: " + event));
            System.out.println("  Registered listener 1");
        });

        executor.submit(() -> {
            registry.addListener("userCreated", event ->
                System.out.println("  Listener 2: " + event));
            System.out.println("  Registered listener 2");
        });

        Thread.sleep(100); // Let listeners register

        // Fire event
        executor.submit(() -> {
            registry.fireEvent("userCreated", "User Alice created");
        });

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("Total listeners: " + registry.getListenerCount("userCreated"));
        System.out.println();
    }

    /**
     * Scenario 6: Thread-safe statistics collector
     */
    private static void demonstrateThreadSafeStatistics() throws InterruptedException {
        System.out.println("--- Scenario 6: Thread-Safe Statistics ---");

        ThreadSafeStats stats = new ThreadSafeStats();

        ExecutorService executor = Executors.newFixedThreadPool(10);

        // Multiple threads recording measurements
        Random random = new Random();
        for (int i = 0; i < 20; i++) {
            executor.submit(() -> {
                double value = 50 + random.nextDouble() * 50;
                stats.record(value);
            });
        }

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("Count: " + stats.getCount());
        System.out.println("Average: " + String.format("%.2f", stats.getAverage()));
        System.out.println("Min: " + String.format("%.2f", stats.getMin()));
        System.out.println("Max: " + String.format("%.2f", stats.getMax()));
        System.out.println();
    }

    /**
     * Scenario 7: BlockingQueue for producer-consumer pattern
     */
    private static void demonstrateBlockingQueue() throws InterruptedException {
        System.out.println("--- Scenario 7: Blocking Queue ---");

        BlockingQueue<Task> taskQueue = new LinkedBlockingQueue<>(5);

        ExecutorService executor = Executors.newFixedThreadPool(4);

        // Producer
        executor.submit(() -> {
            try {
                for (int i = 1; i <= 10; i++) {
                    Task task = new Task("TASK-" + i, "Work item " + i);
                    taskQueue.put(task);
                    System.out.println("  Produced: " + task.getId());
                    Thread.sleep(30);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        // Consumers
        for (int i = 1; i <= 3; i++) {
            int workerNum = i;
            executor.submit(() -> {
                try {
                    while (!Thread.currentThread().isInterrupted()) {
                        Task task = taskQueue.poll(1, TimeUnit.SECONDS);
                        if (task != null) {
                            System.out.println("  Worker " + workerNum + " processing: " + task.getId());
                            Thread.sleep(50);
                        }
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }

        Thread.sleep(1000);
        executor.shutdownNow();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("Queue drained");
        System.out.println();
    }

    /**
     * Scenario 8: ConcurrentHashMap for thread-safe map operations
     */
    private static void demonstrateConcurrentMap() throws InterruptedException {
        System.out.println("--- Scenario 8: Concurrent Map ---");

        ConcurrentHashMap<String, Integer> scoreMap = new ConcurrentHashMap<>();

        ExecutorService executor = Executors.newFixedThreadPool(5);

        // Multiple threads updating scores
        String[] players = {"Alice", "Bob", "Carol", "Dave", "Eve"};

        for (String player : players) {
            executor.submit(() -> {
                for (int i = 0; i < 100; i++) {
                    scoreMap.merge(player, 1, Integer::sum);
                }
            });
        }

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("Player scores:");
        scoreMap.forEach((player, score) ->
            System.out.println("  " + player + ": " + score));
        System.out.println();
    }

    /**
     * Scenario 9: Synchronized collection wrappers
     */
    private static void demonstrateSynchronizedCollections() throws InterruptedException {
        System.out.println("--- Scenario 9: Synchronized Collections ---");

        List<String> syncList = Collections.synchronizedList(new ArrayList<>());

        ExecutorService executor = Executors.newFixedThreadPool(3);

        // Multiple threads adding items
        for (int i = 1; i <= 3; i++) {
            int threadNum = i;
            executor.submit(() -> {
                for (int j = 1; j <= 10; j++) {
                    syncList.add("Thread-" + threadNum + "-Item-" + j);
                }
            });
        }

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("Total items: " + syncList.size());
        System.out.println("First 5 items:");
        synchronized (syncList) {
            syncList.stream().limit(5).forEach(item -> System.out.println("  " + item));
        }
        System.out.println();
    }

    /**
     * Scenario 10: Monitor pattern for complex state management
     */
    private static void demonstrateMonitorPattern() throws InterruptedException {
        System.out.println("--- Scenario 10: Monitor Pattern ---");

        BankAccountMonitor account = new BankAccountMonitor("ACC-001", 1000.0);

        ExecutorService executor = Executors.newFixedThreadPool(4);

        // Multiple deposit and withdrawal operations
        executor.submit(() -> {
            try {
                account.deposit(500.0);
                System.out.println("  Deposited $500");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.submit(() -> {
            try {
                boolean success = account.withdraw(300.0);
                System.out.println("  Withdraw $300: " + (success ? "SUCCESS" : "FAILED"));
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.submit(() -> {
            try {
                boolean success = account.withdraw(1500.0);
                System.out.println("  Withdraw $1500: " + (success ? "SUCCESS" : "INSUFFICIENT FUNDS"));
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.submit(() -> {
            try {
                double balance = account.getBalance();
                System.out.println("  Current balance: $" + balance);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println("Final balance: $" + account.getBalance());
        System.out.println();
    }
}

// ============= Thread-Safe Counter =============

/**
 * Simple counter with implicit locking via synchronized methods.
 */
class ThreadSafeCounter {
    private int count = 0;

    /**
     * Synchronized method automatically acquires and releases lock.
     */
    public synchronized void increment() {
        count++;
    }

    public synchronized void decrement() {
        count--;
    }

    public synchronized int getCount() {
        return count;
    }

    public synchronized void reset() {
        count = 0;
    }
}

// ============= Synchronized Cache =============

/**
 * Cache with implicit locking using synchronized methods.
 */
class SynchronizedCache<K, V> {
    private final Map<K, V> cache = new HashMap<>();

    public synchronized void put(K key, V value) {
        cache.put(key, value);
    }

    public synchronized V get(K key) {
        return cache.get(key);
    }

    public synchronized boolean containsKey(K key) {
        return cache.containsKey(key);
    }

    public synchronized void remove(K key) {
        cache.remove(key);
    }

    public synchronized int size() {
        return cache.size();
    }

    public synchronized void clear() {
        cache.clear();
    }
}

// ============= Connection Pool =============

/**
 * Simple connection pool with implicit locking.
 */
class ConnectionPool {
    private final Queue<Connection> available;
    private final Set<Connection> inUse;
    private final int maxConnections;

    public ConnectionPool(int maxConnections) {
        this.maxConnections = maxConnections;
        this.available = new LinkedList<>();
        this.inUse = new HashSet<>();

        // Initialize pool
        for (int i = 1; i <= maxConnections; i++) {
            available.add(new Connection("CONN-" + i));
        }
    }

    /**
     * Gets a connection from the pool.
     * Synchronized method provides implicit locking.
     */
    public synchronized Connection getConnection() throws InterruptedException {
        while (available.isEmpty()) {
            wait(); // Wait for connection to become available
        }

        Connection conn = available.poll();
        inUse.add(conn);
        return conn;
    }

    /**
     * Returns a connection to the pool.
     */
    public synchronized void releaseConnection(Connection conn) {
        if (inUse.remove(conn)) {
            available.add(conn);
            notify(); // Notify waiting threads
        }
    }

    public synchronized int getAvailableCount() {
        return available.size();
    }

    public synchronized int getInUseCount() {
        return inUse.size();
    }
}

class Connection {
    private final String id;
    private boolean closed = false;

    public Connection(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public void close() {
        this.closed = true;
    }

    public boolean isClosed() {
        return closed;
    }
}

// ============= Message Queue =============

/**
 * Thread-safe message queue using synchronized methods.
 */
class MessageQueue {
    private final Queue<Message> queue = new LinkedList<>();

    public synchronized void enqueue(Message message) {
        queue.add(message);
        notify(); // Notify waiting consumers
    }

    public synchronized Message dequeue() throws InterruptedException {
        while (queue.isEmpty()) {
            wait(); // Wait for messages
        }
        return queue.poll();
    }

    public synchronized int size() {
        return queue.size();
    }

    public synchronized boolean isEmpty() {
        return queue.isEmpty();
    }
}

class Message {
    private final String id;
    private final String content;
    private final long timestamp;

    public Message(String id, String content) {
        this.id = id;
        this.content = content;
        this.timestamp = System.currentTimeMillis();
    }

    public String getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public long getTimestamp() {
        return timestamp;
    }
}

// ============= Event Listener Registry =============

/**
 * Registry for event listeners with synchronized access.
 */
class EventListenerRegistry {
    private final Map<String, List<EventListener>> listeners = new HashMap<>();

    public synchronized void addListener(String eventType, EventListener listener) {
        listeners.computeIfAbsent(eventType, k -> new ArrayList<>()).add(listener);
    }

    public synchronized void removeListener(String eventType, EventListener listener) {
        List<EventListener> eventListeners = listeners.get(eventType);
        if (eventListeners != null) {
            eventListeners.remove(listener);
        }
    }

    public synchronized void fireEvent(String eventType, String eventData) {
        List<EventListener> eventListeners = listeners.get(eventType);
        if (eventListeners != null) {
            for (EventListener listener : eventListeners) {
                listener.onEvent(eventData);
            }
        }
    }

    public synchronized int getListenerCount(String eventType) {
        List<EventListener> eventListeners = listeners.get(eventType);
        return eventListeners != null ? eventListeners.size() : 0;
    }
}

@FunctionalInterface
interface EventListener {
    void onEvent(String eventData);
}

// ============= Thread-Safe Statistics =============

/**
 * Collects statistics with implicit locking.
 */
class ThreadSafeStats {
    private int count = 0;
    private double sum = 0.0;
    private double min = Double.MAX_VALUE;
    private double max = Double.MIN_VALUE;

    public synchronized void record(double value) {
        count++;
        sum += value;
        if (value < min) min = value;
        if (value > max) max = value;
    }

    public synchronized int getCount() {
        return count;
    }

    public synchronized double getAverage() {
        return count > 0 ? sum / count : 0.0;
    }

    public synchronized double getMin() {
        return count > 0 ? min : 0.0;
    }

    public synchronized double getMax() {
        return count > 0 ? max : 0.0;
    }

    public synchronized double getSum() {
        return sum;
    }

    public synchronized void reset() {
        count = 0;
        sum = 0.0;
        min = Double.MAX_VALUE;
        max = Double.MIN_VALUE;
    }
}

// ============= Task =============

class Task {
    private final String id;
    private final String description;

    public Task(String id, String description) {
        this.id = id;
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public String getDescription() {
        return description;
    }
}

// ============= Bank Account Monitor =============

/**
 * Bank account using monitor pattern with implicit locking.
 * All public methods are synchronized.
 */
class BankAccountMonitor {
    private final String accountId;
    private double balance;
    private final List<Transaction> transactions;

    public BankAccountMonitor(String accountId, double initialBalance) {
        this.accountId = accountId;
        this.balance = initialBalance;
        this.transactions = new ArrayList<>();
    }

    /**
     * Deposits money with implicit locking.
     */
    public synchronized void deposit(double amount) throws InterruptedException {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        balance += amount;
        transactions.add(new Transaction("DEPOSIT", amount));
        notifyAll(); // Notify threads waiting for balance
    }

    /**
     * Withdraws money if sufficient funds available.
     */
    public synchronized boolean withdraw(double amount) throws InterruptedException {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }

        if (balance >= amount) {
            balance -= amount;
            transactions.add(new Transaction("WITHDRAWAL", amount));
            return true;
        }
        return false;
    }

    /**
     * Waits until sufficient balance is available, then withdraws.
     */
    public synchronized void withdrawWhenAvailable(double amount) throws InterruptedException {
        while (balance < amount) {
            wait(); // Wait for sufficient balance
        }
        balance -= amount;
        transactions.add(new Transaction("WITHDRAWAL", amount));
    }

    public synchronized double getBalance() throws InterruptedException {
        return balance;
    }

    public synchronized int getTransactionCount() {
        return transactions.size();
    }

    public synchronized List<Transaction> getTransactionHistory() {
        return new ArrayList<>(transactions);
    }

    static class Transaction {
        final String type;
        final double amount;
        final long timestamp;

        Transaction(String type, double amount) {
            this.type = type;
            this.amount = amount;
            this.timestamp = System.currentTimeMillis();
        }
    }
}
