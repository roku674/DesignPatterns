package Cloud.Bulkhead;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.time.Duration;
import java.time.Instant;

/**
 * Bulkhead Pattern Demonstration
 *
 * The Bulkhead pattern isolates critical resources to prevent cascade failures.
 * Named after ship compartments that prevent sinking if one compartment floods.
 *
 * Key Concepts:
 * - Resource Isolation: Separate thread pools for different services
 * - Failure Containment: Prevent one failing service from consuming all resources
 * - System Resilience: Maintain partial functionality during failures
 * - Performance Protection: Prevent resource exhaustion
 *
 * This implementation demonstrates:
 * 1. Thread pool isolation for different services
 * 2. Semaphore-based resource limiting
 * 3. Async operations with CompletableFuture
 * 4. Timeout handling and fallback mechanisms
 * 5. Resource monitoring and metrics
 * 6. Queue management for pending requests
 * 7. Circuit breaker integration
 * 8. Graceful degradation strategies
 */
public class Main {
    public static void main(String[] args) throws Exception {
        System.out.println("=== Bulkhead Pattern Demo ===\n");

        // Scenario 1: Basic Thread Pool Isolation
        demonstrateThreadPoolIsolation();

        // Scenario 2: Semaphore-based Bulkhead
        demonstrateSemaphoreBulkhead();

        // Scenario 3: Resource Pool Management
        demonstrateResourcePooling();

        // Scenario 4: Service Isolation with Fallback
        demonstrateServiceIsolationWithFallback();

        // Scenario 5: Rate Limiting and Throttling
        demonstrateRateLimiting();

        // Scenario 6: Priority-based Resource Allocation
        demonstratePriorityQueuing();

        // Scenario 7: Cascading Failure Prevention
        demonstrateCascadeFailurePrevention();

        // Scenario 8: Bulkhead Metrics and Monitoring
        demonstrateMetricsAndMonitoring();

        System.out.println("\n=== All Bulkhead Scenarios Completed ===");
    }

    /**
     * Scenario 1: Thread Pool Isolation
     * Demonstrates isolating services with separate thread pools
     */
    private static void demonstrateThreadPoolIsolation() throws Exception {
        System.out.println("--- Scenario 1: Thread Pool Isolation ---");

        ThreadPoolBulkhead bulkhead = new ThreadPoolBulkhead();

        // Execute tasks in different isolated pools
        List<CompletableFuture<String>> futures = new ArrayList<>();

        System.out.println("Executing tasks across isolated thread pools...");

        // Payment service tasks (isolated pool)
        for (int i = 0; i < 3; i++) {
            int taskId = i;
            CompletableFuture<String> future = bulkhead.executePayment(() -> {
                Thread.sleep(100);
                return "Payment-" + taskId + " completed";
            });
            futures.add(future);
        }

        // Inventory service tasks (isolated pool)
        for (int i = 0; i < 3; i++) {
            int taskId = i;
            CompletableFuture<String> future = bulkhead.executeInventory(() -> {
                Thread.sleep(100);
                return "Inventory-" + taskId + " completed";
            });
            futures.add(future);
        }

        // Wait for all tasks
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).get();

        futures.forEach(f -> {
            try {
                System.out.println("  Result: " + f.get());
            } catch (Exception e) {
                System.out.println("  Failed: " + e.getMessage());
            }
        });

        bulkhead.shutdown();
        System.out.println();
    }

    /**
     * Scenario 2: Semaphore-based Bulkhead
     * Limits concurrent access using semaphores
     */
    private static void demonstrateSemaphoreBulkhead() throws Exception {
        System.out.println("--- Scenario 2: Semaphore-based Bulkhead ---");

        SemaphoreBulkhead bulkhead = new SemaphoreBulkhead(3);

        List<CompletableFuture<String>> futures = new ArrayList<>();

        System.out.println("Attempting to execute 10 tasks with max 3 concurrent...");

        for (int i = 0; i < 10; i++) {
            int taskId = i;
            CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
                try {
                    return bulkhead.execute(() -> {
                        Thread.sleep(200);
                        return "Task-" + taskId + " completed";
                    });
                } catch (Exception e) {
                    return "Task-" + taskId + " failed: " + e.getMessage();
                }
            });
            futures.add(future);
        }

        // Wait and display results
        for (CompletableFuture<String> future : futures) {
            System.out.println("  " + future.get());
        }

        System.out.println("Max concurrent reached: " + bulkhead.getMaxConcurrent());
        System.out.println();
    }

    /**
     * Scenario 3: Resource Pool Management
     * Manages limited resources with pooling
     */
    private static void demonstrateResourcePooling() throws Exception {
        System.out.println("--- Scenario 3: Resource Pool Management ---");

        DatabaseConnectionPool pool = new DatabaseConnectionPool(5);

        System.out.println("Acquiring connections from pool (max 5)...");

        List<CompletableFuture<String>> futures = new ArrayList<>();

        for (int i = 0; i < 8; i++) {
            int connId = i;
            CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
                try {
                    DatabaseConnection conn = pool.acquire(Duration.ofSeconds(2));
                    try {
                        Thread.sleep(100);
                        return "Connection-" + connId + " used: " + conn.getId();
                    } finally {
                        pool.release(conn);
                    }
                } catch (Exception e) {
                    return "Connection-" + connId + " failed: " + e.getMessage();
                }
            });
            futures.add(future);
        }

        for (CompletableFuture<String> future : futures) {
            System.out.println("  " + future.get());
        }

        System.out.println("Pool stats - Available: " + pool.getAvailableCount() +
                         ", In use: " + pool.getInUseCount());
        System.out.println();
    }

    /**
     * Scenario 4: Service Isolation with Fallback
     * Demonstrates fallback when bulkhead is full
     */
    private static void demonstrateServiceIsolationWithFallback() throws Exception {
        System.out.println("--- Scenario 4: Service Isolation with Fallback ---");

        BulkheadWithFallback bulkhead = new BulkheadWithFallback(2, 5);

        List<CompletableFuture<String>> futures = new ArrayList<>();

        System.out.println("Executing tasks with fallback mechanism...");

        for (int i = 0; i < 10; i++) {
            int taskId = i;
            CompletableFuture<String> future = bulkhead.executeWithFallback(
                () -> {
                    Thread.sleep(300);
                    return "Primary: Task-" + taskId;
                },
                () -> "Fallback: Task-" + taskId + " (bulkhead full)"
            );
            futures.add(future);
        }

        for (CompletableFuture<String> future : futures) {
            System.out.println("  " + future.get());
        }

        System.out.println();
    }

    /**
     * Scenario 5: Rate Limiting and Throttling
     * Controls request rate to prevent overload
     */
    private static void demonstrateRateLimiting() throws Exception {
        System.out.println("--- Scenario 5: Rate Limiting and Throttling ---");

        RateLimitedBulkhead bulkhead = new RateLimitedBulkhead(5, Duration.ofSeconds(1));

        System.out.println("Attempting rapid requests (5 per second limit)...");

        for (int i = 0; i < 12; i++) {
            int requestId = i;
            long start = System.currentTimeMillis();

            CompletableFuture<String> future = bulkhead.executeAsync(() -> {
                return "Request-" + requestId + " processed";
            });

            try {
                String result = future.get(100, TimeUnit.MILLISECONDS);
                long elapsed = System.currentTimeMillis() - start;
                System.out.println("  " + result + " (waited: " + elapsed + "ms)");
            } catch (TimeoutException e) {
                System.out.println("  Request-" + requestId + " rate limited (waiting...)");
                Thread.sleep(100);
            }
        }

        System.out.println();
    }

    /**
     * Scenario 6: Priority-based Resource Allocation
     * Allocates resources based on priority
     */
    private static void demonstratePriorityQueuing() throws Exception {
        System.out.println("--- Scenario 6: Priority-based Resource Allocation ---");

        PriorityBulkhead bulkhead = new PriorityBulkhead(2);

        System.out.println("Submitting tasks with different priorities...");

        // Submit low priority tasks first
        for (int i = 0; i < 3; i++) {
            int taskId = i;
            bulkhead.submitTask(Priority.LOW, () -> {
                Thread.sleep(200);
                System.out.println("  LOW priority task-" + taskId + " completed");
                return null;
            });
        }

        // Submit high priority tasks
        for (int i = 0; i < 3; i++) {
            int taskId = i;
            bulkhead.submitTask(Priority.HIGH, () -> {
                Thread.sleep(200);
                System.out.println("  HIGH priority task-" + taskId + " completed");
                return null;
            });
        }

        // Submit medium priority tasks
        for (int i = 0; i < 3; i++) {
            int taskId = i;
            bulkhead.submitTask(Priority.MEDIUM, () -> {
                Thread.sleep(200);
                System.out.println("  MEDIUM priority task-" + taskId + " completed");
                return null;
            });
        }

        Thread.sleep(3000);
        bulkhead.shutdown();
        System.out.println();
    }

    /**
     * Scenario 7: Cascading Failure Prevention
     * Prevents failures from cascading across services
     */
    private static void demonstrateCascadeFailurePrevention() throws Exception {
        System.out.println("--- Scenario 7: Cascading Failure Prevention ---");

        ServiceBulkheadManager manager = new ServiceBulkheadManager();

        System.out.println("Simulating service failure scenarios...");

        // Service A - healthy
        for (int i = 0; i < 3; i++) {
            int taskId = i;
            manager.executeOnService("ServiceA", () -> {
                Thread.sleep(50);
                return "ServiceA-" + taskId + " OK";
            }).thenAccept(result -> System.out.println("  " + result));
        }

        // Service B - failing
        for (int i = 0; i < 3; i++) {
            int taskId = i;
            manager.executeOnService("ServiceB", () -> {
                Thread.sleep(50);
                if (taskId > 0) throw new RuntimeException("ServiceB failure");
                return "ServiceB-" + taskId + " OK";
            }).exceptionally(ex -> {
                System.out.println("  ServiceB failed (isolated): " + ex.getMessage());
                return null;
            });
        }

        // Service C - should remain healthy despite B failing
        for (int i = 0; i < 3; i++) {
            int taskId = i;
            manager.executeOnService("ServiceC", () -> {
                Thread.sleep(50);
                return "ServiceC-" + taskId + " OK";
            }).thenAccept(result -> System.out.println("  " + result));
        }

        Thread.sleep(1000);
        manager.shutdown();
        System.out.println("Services A and C remained healthy despite B failing");
        System.out.println();
    }

    /**
     * Scenario 8: Bulkhead Metrics and Monitoring
     * Collects and displays bulkhead metrics
     */
    private static void demonstrateMetricsAndMonitoring() throws Exception {
        System.out.println("--- Scenario 8: Bulkhead Metrics and Monitoring ---");

        MonitoredBulkhead bulkhead = new MonitoredBulkhead(3, 10);

        System.out.println("Executing tasks and collecting metrics...");

        List<CompletableFuture<Void>> futures = new ArrayList<>();

        for (int i = 0; i < 15; i++) {
            int taskId = i;
            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                try {
                    bulkhead.execute(() -> {
                        Thread.sleep(100 + new Random().nextInt(200));
                        if (taskId % 7 == 0) throw new RuntimeException("Simulated failure");
                        return "Task-" + taskId;
                    });
                } catch (Exception e) {
                    // Task failed
                }
            });
            futures.add(future);
        }

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).get();

        System.out.println("\nBulkhead Metrics:");
        BulkheadMetrics metrics = bulkhead.getMetrics();
        System.out.println("  Total requests: " + metrics.getTotalRequests());
        System.out.println("  Successful: " + metrics.getSuccessCount());
        System.out.println("  Failed: " + metrics.getFailureCount());
        System.out.println("  Rejected: " + metrics.getRejectedCount());
        System.out.println("  Average wait time: " + metrics.getAverageWaitTime() + "ms");
        System.out.println("  Peak concurrent: " + metrics.getPeakConcurrent());
        System.out.println();
    }
}

/**
 * Thread pool-based bulkhead for service isolation
 */
class ThreadPoolBulkhead {
    private final ExecutorService paymentPool;
    private final ExecutorService inventoryPool;

    public ThreadPoolBulkhead() {
        this.paymentPool = Executors.newFixedThreadPool(3);
        this.inventoryPool = Executors.newFixedThreadPool(3);
    }

    public <T> CompletableFuture<T> executePayment(Callable<T> task) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return task.call();
            } catch (Exception e) {
                throw new CompletionException(e);
            }
        }, paymentPool);
    }

    public <T> CompletableFuture<T> executeInventory(Callable<T> task) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return task.call();
            } catch (Exception e) {
                throw new CompletionException(e);
            }
        }, inventoryPool);
    }

    public void shutdown() {
        paymentPool.shutdown();
        inventoryPool.shutdown();
    }
}

/**
 * Semaphore-based bulkhead for limiting concurrency
 */
class SemaphoreBulkhead {
    private final Semaphore semaphore;
    private final AtomicInteger maxConcurrent = new AtomicInteger(0);
    private final AtomicInteger currentConcurrent = new AtomicInteger(0);

    public SemaphoreBulkhead(int maxConcurrent) {
        this.semaphore = new Semaphore(maxConcurrent);
    }

    public <T> T execute(Callable<T> task) throws Exception {
        if (!semaphore.tryAcquire(1, TimeUnit.SECONDS)) {
            throw new BulkheadFullException("Bulkhead is full");
        }

        int concurrent = currentConcurrent.incrementAndGet();
        maxConcurrent.updateAndGet(max -> Math.max(max, concurrent));

        try {
            return task.call();
        } finally {
            currentConcurrent.decrementAndGet();
            semaphore.release();
        }
    }

    public int getMaxConcurrent() {
        return maxConcurrent.get();
    }
}

/**
 * Database connection pool demonstrating resource pooling
 */
class DatabaseConnectionPool {
    private final BlockingQueue<DatabaseConnection> availableConnections;
    private final Set<DatabaseConnection> inUseConnections;
    private final int maxSize;

    public DatabaseConnectionPool(int maxSize) {
        this.maxSize = maxSize;
        this.availableConnections = new LinkedBlockingQueue<>();
        this.inUseConnections = ConcurrentHashMap.newKeySet();

        for (int i = 0; i < maxSize; i++) {
            availableConnections.add(new DatabaseConnection("CONN-" + i));
        }
    }

    public DatabaseConnection acquire(Duration timeout) throws Exception {
        DatabaseConnection conn = availableConnections.poll(timeout.toMillis(), TimeUnit.MILLISECONDS);
        if (conn == null) {
            throw new TimeoutException("No connection available");
        }
        inUseConnections.add(conn);
        return conn;
    }

    public void release(DatabaseConnection connection) {
        inUseConnections.remove(connection);
        availableConnections.offer(connection);
    }

    public int getAvailableCount() {
        return availableConnections.size();
    }

    public int getInUseCount() {
        return inUseConnections.size();
    }
}

class DatabaseConnection {
    private final String id;

    public DatabaseConnection(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }
}

/**
 * Bulkhead with fallback mechanism
 */
class BulkheadWithFallback {
    private final Semaphore semaphore;
    private final ExecutorService executor;

    public BulkheadWithFallback(int maxConcurrent, int queueSize) {
        this.semaphore = new Semaphore(maxConcurrent);
        this.executor = new ThreadPoolExecutor(
            maxConcurrent, maxConcurrent, 0L, TimeUnit.MILLISECONDS,
            new ArrayBlockingQueue<>(queueSize)
        );
    }

    public <T> CompletableFuture<T> executeWithFallback(
            Callable<T> primary,
            Callable<T> fallback) {

        if (semaphore.tryAcquire()) {
            return CompletableFuture.supplyAsync(() -> {
                try {
                    return primary.call();
                } catch (Exception e) {
                    throw new CompletionException(e);
                } finally {
                    semaphore.release();
                }
            }, executor);
        } else {
            return CompletableFuture.supplyAsync(() -> {
                try {
                    return fallback.call();
                } catch (Exception e) {
                    throw new CompletionException(e);
                }
            });
        }
    }
}

/**
 * Rate-limited bulkhead
 */
class RateLimitedBulkhead {
    private final Semaphore rateLimiter;
    private final ScheduledExecutorService scheduler;

    public RateLimitedBulkhead(int requestsPerWindow, Duration window) {
        this.rateLimiter = new Semaphore(requestsPerWindow);
        this.scheduler = Executors.newScheduledThreadPool(1);

        scheduler.scheduleAtFixedRate(() -> {
            rateLimiter.release(requestsPerWindow - rateLimiter.availablePermits());
        }, window.toMillis(), window.toMillis(), TimeUnit.MILLISECONDS);
    }

    public <T> CompletableFuture<T> executeAsync(Callable<T> task) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                rateLimiter.acquire();
                return task.call();
            } catch (Exception e) {
                throw new CompletionException(e);
            }
        });
    }
}

enum Priority {
    HIGH(3), MEDIUM(2), LOW(1);

    private final int value;

    Priority(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}

/**
 * Priority-based bulkhead
 */
class PriorityBulkhead {
    private final ExecutorService executor;
    private final PriorityBlockingQueue<PrioritizedTask> queue;

    public PriorityBulkhead(int threads) {
        this.queue = new PriorityBlockingQueue<>();
        this.executor = Executors.newFixedThreadPool(threads);

        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                while (!Thread.currentThread().isInterrupted()) {
                    try {
                        PrioritizedTask task = queue.take();
                        task.run();
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            });
        }
    }

    public void submitTask(Priority priority, Callable<Void> task) {
        queue.offer(new PrioritizedTask(priority, task));
    }

    public void shutdown() {
        executor.shutdown();
    }

    static class PrioritizedTask implements Comparable<PrioritizedTask>, Runnable {
        private final Priority priority;
        private final Callable<Void> task;
        private final long timestamp;

        public PrioritizedTask(Priority priority, Callable<Void> task) {
            this.priority = priority;
            this.task = task;
            this.timestamp = System.nanoTime();
        }

        @Override
        public int compareTo(PrioritizedTask other) {
            int priorityCompare = Integer.compare(other.priority.getValue(), this.priority.getValue());
            if (priorityCompare != 0) return priorityCompare;
            return Long.compare(this.timestamp, other.timestamp);
        }

        @Override
        public void run() {
            try {
                task.call();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}

/**
 * Service bulkhead manager for multiple services
 */
class ServiceBulkheadManager {
    private final Map<String, ExecutorService> serviceExecutors;

    public ServiceBulkheadManager() {
        this.serviceExecutors = new ConcurrentHashMap<>();
    }

    public <T> CompletableFuture<T> executeOnService(String serviceName, Callable<T> task) {
        ExecutorService executor = serviceExecutors.computeIfAbsent(
            serviceName,
            k -> Executors.newFixedThreadPool(3)
        );

        return CompletableFuture.supplyAsync(() -> {
            try {
                return task.call();
            } catch (Exception e) {
                throw new CompletionException(e);
            }
        }, executor);
    }

    public void shutdown() {
        serviceExecutors.values().forEach(ExecutorService::shutdown);
    }
}

/**
 * Monitored bulkhead with metrics
 */
class MonitoredBulkhead {
    private final Semaphore semaphore;
    private final BulkheadMetrics metrics;

    public MonitoredBulkhead(int maxConcurrent, int maxQueue) {
        this.semaphore = new Semaphore(maxConcurrent);
        this.metrics = new BulkheadMetrics();
    }

    public <T> T execute(Callable<T> task) throws Exception {
        metrics.incrementTotalRequests();
        long startWait = System.currentTimeMillis();

        if (!semaphore.tryAcquire(1, TimeUnit.SECONDS)) {
            metrics.incrementRejected();
            throw new BulkheadFullException("Rejected");
        }

        long waitTime = System.currentTimeMillis() - startWait;
        metrics.recordWaitTime(waitTime);
        metrics.incrementConcurrent();

        try {
            T result = task.call();
            metrics.incrementSuccess();
            return result;
        } catch (Exception e) {
            metrics.incrementFailure();
            throw e;
        } finally {
            metrics.decrementConcurrent();
            semaphore.release();
        }
    }

    public BulkheadMetrics getMetrics() {
        return metrics;
    }
}

/**
 * Metrics collector for bulkhead
 */
class BulkheadMetrics {
    private final AtomicInteger totalRequests = new AtomicInteger(0);
    private final AtomicInteger successCount = new AtomicInteger(0);
    private final AtomicInteger failureCount = new AtomicInteger(0);
    private final AtomicInteger rejectedCount = new AtomicInteger(0);
    private final AtomicInteger currentConcurrent = new AtomicInteger(0);
    private final AtomicInteger peakConcurrent = new AtomicInteger(0);
    private final List<Long> waitTimes = new CopyOnWriteArrayList<>();

    public void incrementTotalRequests() {
        totalRequests.incrementAndGet();
    }

    public void incrementSuccess() {
        successCount.incrementAndGet();
    }

    public void incrementFailure() {
        failureCount.incrementAndGet();
    }

    public void incrementRejected() {
        rejectedCount.incrementAndGet();
    }

    public void incrementConcurrent() {
        int current = currentConcurrent.incrementAndGet();
        peakConcurrent.updateAndGet(peak -> Math.max(peak, current));
    }

    public void decrementConcurrent() {
        currentConcurrent.decrementAndGet();
    }

    public void recordWaitTime(long waitTime) {
        waitTimes.add(waitTime);
    }

    public int getTotalRequests() {
        return totalRequests.get();
    }

    public int getSuccessCount() {
        return successCount.get();
    }

    public int getFailureCount() {
        return failureCount.get();
    }

    public int getRejectedCount() {
        return rejectedCount.get();
    }

    public int getPeakConcurrent() {
        return peakConcurrent.get();
    }

    public long getAverageWaitTime() {
        return waitTimes.isEmpty() ? 0 :
            waitTimes.stream().mapToLong(Long::longValue).sum() / waitTimes.size();
    }
}

class BulkheadFullException extends RuntimeException {
    public BulkheadFullException(String message) {
        super(message);
    }
}
