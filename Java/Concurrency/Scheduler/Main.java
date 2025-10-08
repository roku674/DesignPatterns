package Concurrency.Scheduler;

/**
 * Scheduler Pattern Demonstration
 *
 * Manages the execution order of operations
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Scheduler Pattern Demo ===\n");

        // Create implementation
        SchedulerImpl implementation = new SchedulerImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
