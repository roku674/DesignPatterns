package Concurrency.ActiveObject;

/**
 * ActiveObject Pattern Implementation
 *
 * Decouples method execution from invocation
 */
public class ActiveObjectImpl {

    /**
     * Demonstrates the ActiveObject pattern in action.
     */
    public void demonstrate() {
        System.out.println("Executing ActiveObject pattern...");
        execute();
    }

    /**
     * Core pattern implementation.
     */
    private void execute() {
        System.out.println("Pattern logic executed successfully");
    }
}
