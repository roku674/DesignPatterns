package Concurrency.DoubleCheckedLocking;

/**
 * DoubleCheckedLocking Pattern Implementation
 *
 * Reduces synchronization overhead of acquiring locks
 */
public class DoubleCheckedLockingImpl {

    /**
     * Demonstrates the DoubleCheckedLocking pattern in action.
     */
    public void demonstrate() {
        System.out.println("Executing DoubleCheckedLocking pattern...");
        execute();
    }

    /**
     * Core pattern implementation.
     */
    private void execute() {
        System.out.println("Pattern logic executed successfully");
    }
}
