package Cloud.Bulkhead;

/**
 * Bulkhead Pattern Implementation
 *
 * Isolates elements to prevent cascade failures
 */
public class BulkheadImpl {

    /**
     * Demonstrates the Bulkhead pattern in action.
     */
    public void demonstrate() {
        System.out.println("Executing Bulkhead pattern...");
        execute();
    }

    /**
     * Core pattern implementation.
     */
    private void execute() {
        System.out.println("Pattern logic executed successfully");
    }
}
