package Concurrency.ThreadPool;

import java.util.concurrent.BlockingQueue;

/**
 * WorkerThread
 *
 * Represents a worker thread in the thread pool that continuously
 * processes tasks from the shared task queue.
 */
public class WorkerThread extends Thread {
    private final BlockingQueue<Runnable> taskQueue;
    private volatile boolean running = true;

    /**
     * Constructs a new worker thread.
     *
     * @param taskQueue The shared task queue
     * @param name The name of this worker thread
     */
    public WorkerThread(BlockingQueue<Runnable> taskQueue, String name) {
        super(name);
        this.taskQueue = taskQueue;
    }

    /**
     * Main execution loop for the worker thread.
     * Continuously takes tasks from the queue and executes them.
     */
    @Override
    public void run() {
        System.out.println(getName() + " started");

        while (running) {
            try {
                // Take task from queue (blocks if empty)
                Runnable task = taskQueue.take();

                // Check for poison pill (shutdown signal)
                if (task == ThreadPoolImpl.POISON_PILL) {
                    System.out.println(getName() + " received shutdown signal");
                    break;
                }

                // Execute the task
                System.out.println(getName() + " executing task");
                task.run();
                System.out.println(getName() + " completed task");

            } catch (InterruptedException e) {
                System.out.println(getName() + " interrupted");
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                System.err.println(getName() + " task execution error: " + e.getMessage());
            }
        }

        System.out.println(getName() + " stopped");
    }

    /**
     * Signals the worker thread to stop processing tasks.
     */
    public void shutdown() {
        running = false;
        interrupt();
    }
}
