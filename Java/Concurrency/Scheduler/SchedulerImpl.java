package Concurrency.Scheduler;

import java.util.*;
import java.util.concurrent.*;

/**
 * Scheduler Pattern Implementation
 *
 * Controls the order in which threads execute based on scheduling criteria
 * such as priority, fairness, or custom policies.
 */
public class SchedulerImpl {
    
    private final PriorityBlockingQueue<ScheduledTask> taskQueue;
    private final ExecutorService executor;
    private volatile boolean running = true;
    
    static class ScheduledTask implements Comparable<ScheduledTask> {
        final Runnable task;
        final int priority;
        final long scheduledTime;
        
        ScheduledTask(Runnable task, int priority, long delay) {
            this.task = task;
            this.priority = priority;
            this.scheduledTime = System.currentTimeMillis() + delay;
        }
        
        @Override
        public int compareTo(ScheduledTask other) {
            // Higher priority first, then earlier time
            int priorityCompare = Integer.compare(other.priority, this.priority);
            if (priorityCompare != 0) return priorityCompare;
            return Long.compare(this.scheduledTime, other.scheduledTime);
        }
    }
    
    public SchedulerImpl() {
        this.taskQueue = new PriorityBlockingQueue<>();
        this.executor = Executors.newFixedThreadPool(2);
        
        // Start scheduler thread
        new Thread(() -> {
            while (running) {
                try {
                    ScheduledTask task = taskQueue.take();
                    long delay = task.scheduledTime - System.currentTimeMillis();
                    if (delay > 0) {
                        Thread.sleep(delay);
                    }
                    executor.execute(task.task);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }, "Scheduler").start();
    }
    
    /**
     * Schedules a task with given priority and delay.
     *
     * @param task The task to execute
     * @param priority Task priority (higher = sooner)
     * @param delayMs Delay in milliseconds
     */
    public void schedule(Runnable task, int priority, long delayMs) {
        taskQueue.offer(new ScheduledTask(task, priority, delayMs));
        System.out.println("Scheduled task with priority " + priority + 
            ", delay " + delayMs + "ms");
    }
    
    /**
     * Shuts down the scheduler.
     */
    public void shutdown() {
        running = false;
        executor.shutdown();
    }
    
    /**
     * Demonstrates the Scheduler pattern.
     */
    public void demonstrate() {
        System.out.println("=== Scheduler Pattern Demonstration ===\n");
        
        System.out.println("Scenario 1: Priority-Based Scheduling");
        System.out.println("-".repeat(50));
        
        schedule(() -> System.out.println("Low priority task executed"), 1, 100);
        schedule(() -> System.out.println("High priority task executed"), 10, 100);
        schedule(() -> System.out.println("Medium priority task executed"), 5, 100);
        
        try { Thread.sleep(2000); } catch (InterruptedException e) {}
        
        System.out.println("\nScenario 2: Delayed Execution");
        System.out.println("-".repeat(50));
        
        schedule(() -> System.out.println("Immediate task"), 5, 0);
        schedule(() -> System.out.println("Delayed 500ms task"), 5, 500);
        schedule(() -> System.out.println("Delayed 1000ms task"), 5, 1000);
        
        try { Thread.sleep(2000); } catch (InterruptedException e) {}
        
        shutdown();
        System.out.println("\nScheduler demonstration complete");
    }
}
