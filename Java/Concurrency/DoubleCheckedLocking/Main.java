package Concurrency.DoubleCheckedLocking;

/**
 * DoubleCheckedLocking Pattern Demonstration
 *
 * Reduces synchronization overhead of acquiring locks
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== DoubleCheckedLocking Pattern Demo ===\n");

        // Get singleton instance and demonstrate pattern
        DoubleCheckedLockingImpl implementation = DoubleCheckedLockingImpl.getInstance();
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
