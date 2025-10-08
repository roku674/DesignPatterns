package Concurrency.Balking;

/**
 * Balking Pattern Implementation
 *
 * Executes action only when object is in appropriate state
 */
public class BalkingImpl {

    /**
     * Demonstrates the Balking pattern in action.
     */
    public void demonstrate() {
        System.out.println("Executing Balking pattern...");
        execute();
    }

    /**
     * Core pattern implementation.
     */
    private void execute() {
        System.out.println("Pattern logic executed successfully");
    }
}
