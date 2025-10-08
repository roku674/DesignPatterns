package Concurrency.DoubleCheckedLocking;

/**
 * DoubleCheckedLocking Pattern Demonstration
 *
 * Reduces synchronization overhead of acquiring locks
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== DoubleCheckedLocking Pattern Demo ===\n");

        // Create implementation
        DoubleCheckedLockingImpl implementation = new DoubleCheckedLockingImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
