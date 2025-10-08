package Concurrency.MonitorObject;

/**
 * MonitorObject Pattern Implementation
 *
 * Synchronizes concurrent method execution with one monitor lock
 */
public class MonitorObjectImpl {

    /**
     * Demonstrates the MonitorObject pattern in action.
     */
    public void demonstrate() {
        System.out.println("Executing MonitorObject pattern...");
        execute();
    }

    /**
     * Core pattern implementation.
     */
    private void execute() {
        System.out.println("Pattern logic executed successfully");
    }
}
