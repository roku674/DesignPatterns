package Concurrency.ThreadPool;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * ThreadPool Pattern Implementation
 *
 * The Thread Pool pattern improves performance and resource management by:
 * - Reusing a fixed number of worker threads
 * - Eliminating thread creation/destruction overhead
 * - Controlling concurrent execution limits
 * - Queuing tasks when all threads are busy
 *
 * This implementation provides:
 * - Configurable pool size
 * - Bounded task queue
 * - Graceful shutdown
 * - Task rejection handling
 * - Thread lifecycle management
 */
public class ThreadPoolImpl {

    private final int poolSize;
    private final BlockingQueue<Runnable> taskQueue;
    private final List<WorkerThread> workers;
    private volatile boolean shutdown = false;
    private final AtomicInteger activeThreads;
    private final AtomicInteger completedTasks;

    // Poison pill used to signal shutdown
    static final Runnable POISON_PILL = () -> {};

    /**
     * Constructs a thread pool with specified size and queue capacity.
     *
     * @param poolSize Number of worker threads in the pool
     * @param queueCapacity Maximum number of queued tasks
     */
    public ThreadPoolImpl(int poolSize, int queueCapacity) {
        this.poolSize = poolSize;
        this.taskQueue = new LinkedBlockingQueue<>(queueCapacity);
        this.workers = new ArrayList<>(poolSize);
        this.activeThreads = new AtomicInteger(0);
        this.completedTasks = new AtomicInteger(0);

        // Initialize worker threads
        for (int i = 0; i < poolSize; i++) {
            WorkerThread worker = new WorkerThread(taskQueue, "Worker-" + i);
            workers.add(worker);
            worker.start();
            activeThreads.incrementAndGet();
        }
    }

    /**
     * Default constructor with default pool size and queue capacity.
     */
    public ThreadPoolImpl() {
        this(4, 10);
    }

    /**
     * Submits a task to the thread pool for execution.
     *
     * @param task The task to execute
     * @return true if task was accepted, false if rejected
     */
    public boolean execute(Runnable task) {
        if (shutdown) {
            System.err.println("Cannot accept task - thread pool is shutdown");
            return false;
        }

        try {
            taskQueue.put(task);
            return true;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.err.println("Task submission interrupted");
            return false;
        }
    }

    /**
     * Attempts to submit a task with a timeout.
     *
     * @param task The task to execute
     * @param timeout The maximum time to wait
     * @param unit The time unit
     * @return true if task was accepted, false if rejected or timeout
     */
    public boolean execute(Runnable task, long timeout, TimeUnit unit) {
        if (shutdown) {
            System.err.println("Cannot accept task - thread pool is shutdown");
            return false;
        }

        try {
            return taskQueue.offer(task, timeout, unit);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            System.err.println("Task submission interrupted");
            return false;
        }
    }

    /**
     * Initiates an orderly shutdown of the thread pool.
     * Previously submitted tasks are executed, but no new tasks are accepted.
     */
    public void shutdown() {
        if (shutdown) {
            return;
        }

        shutdown = true;
        System.out.println("Shutting down thread pool...");

        // Send poison pill to each worker
        for (int i = 0; i < poolSize; i++) {
            try {
                taskQueue.put(POISON_PILL);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    /**
     * Waits for all threads to terminate.
     *
     * @param timeout The maximum time to wait
     * @param unit The time unit
     * @return true if all threads terminated, false if timeout
     */
    public boolean awaitTermination(long timeout, TimeUnit unit) throws InterruptedException {
        long deadline = System.currentTimeMillis() + unit.toMillis(timeout);

        for (WorkerThread worker : workers) {
            long remaining = deadline - System.currentTimeMillis();
            if (remaining <= 0) {
                return false;
            }
            worker.join(remaining);
            if (worker.isAlive()) {
                return false;
            }
        }

        return true;
    }

    /**
     * Immediately shuts down the pool, attempting to stop all tasks.
     */
    public void shutdownNow() {
        shutdown = true;
        System.out.println("Force shutting down thread pool...");

        for (WorkerThread worker : workers) {
            worker.shutdown();
        }

        taskQueue.clear();
    }

    /**
     * Returns the current number of active worker threads.
     *
     * @return Number of active threads
     */
    public int getActiveThreadCount() {
        return activeThreads.get();
    }

    /**
     * Returns the number of tasks waiting in the queue.
     *
     * @return Number of queued tasks
     */
    public int getQueueSize() {
        return taskQueue.size();
    }

    /**
     * Returns the number of completed tasks.
     *
     * @return Number of completed tasks
     */
    public int getCompletedTaskCount() {
        return completedTasks.get();
    }

    /**
     * Checks if the thread pool is shutdown.
     *
     * @return true if shutdown, false otherwise
     */
    public boolean isShutdown() {
        return shutdown;
    }

    /**
     * Demonstrates the ThreadPool pattern with various scenarios.
     */
    public void demonstrate() {
        System.out.println("=== Thread Pool Pattern Demonstration ===\n");

        // Scenario 1: Basic task execution
        System.out.println("Scenario 1: Basic Task Execution");
        System.out.println("-".repeat(50));

        for (int i = 1; i <= 5; i++) {
            final int taskId = i;
            execute(() -> {
                System.out.println("Task " + taskId + " running on " + Thread.currentThread().getName());
                try {
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }

        sleepQuietly(3000);

        // Scenario 2: Heavy load with queue
        System.out.println("\nScenario 2: Heavy Load (Testing Queue)");
        System.out.println("-".repeat(50));

        for (int i = 1; i <= 8; i++) {
            final int taskId = i;
            boolean accepted = execute(() -> {
                System.out.println("Heavy task " + taskId + " executing");
                sleepQuietly(500);
            });
            System.out.println("Task " + taskId + (accepted ? " accepted" : " rejected"));
        }

        sleepQuietly(3000);

        // Scenario 3: Task with exception
        System.out.println("\nScenario 3: Exception Handling");
        System.out.println("-".repeat(50));

        execute(() -> {
            System.out.println("Task with exception starting");
            throw new RuntimeException("Simulated task failure");
        });

        sleepQuietly(1000);

        // Scenario 4: Pool statistics
        System.out.println("\nScenario 4: Pool Statistics");
        System.out.println("-".repeat(50));
        System.out.println("Active threads: " + getActiveThreadCount());
        System.out.println("Queue size: " + getQueueSize());
        System.out.println("Completed tasks: " + getCompletedTaskCount());

        // Scenario 5: Graceful shutdown
        System.out.println("\nScenario 5: Graceful Shutdown");
        System.out.println("-".repeat(50));

        execute(() -> {
            System.out.println("Final task before shutdown");
            sleepQuietly(1000);
        });

        shutdown();

        try {
            boolean terminated = awaitTermination(5, TimeUnit.SECONDS);
            System.out.println("Pool terminated: " + terminated);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        System.out.println("\nThread Pool demonstration complete");
    }

    /**
     * Helper method to sleep without checked exception.
     */
    private void sleepQuietly(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
