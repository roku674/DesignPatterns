package Concurrency.ThreadPool;

/**
 * ThreadPool Pattern Demonstration
 *
 * The Thread Pool pattern manages a pool of worker threads that execute
 * submitted tasks. This improves performance by:
 * - Reusing threads instead of creating/destroying them
 * - Limiting concurrent execution
 * - Queuing excess tasks
 * - Providing lifecycle management
 *
 * Key Components:
 * - ThreadPool: Manages worker threads and task queue
 * - WorkerThread: Thread that executes tasks from queue
 * - Task Queue: Holds pending tasks
 * - Poison Pill: Shutdown signal
 *
 * Use Cases:
 * - Server request handling
 * - Batch processing
 * - Parallel computations
 * - I/O operations
 *
 * Benefits:
 * - Reduced thread creation overhead
 * - Controlled resource usage
 * - Better throughput
 * - Graceful degradation under load
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ThreadPool Pattern Demo ===\n");

        // Create thread pool with 4 workers and queue capacity of 10
        ThreadPoolImpl threadPool = new ThreadPoolImpl(4, 10);

        // Run comprehensive demonstration
        threadPool.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
