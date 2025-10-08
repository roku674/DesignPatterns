package Cloud.BulkheadIsolation;

/**
 * BulkheadIsolation Pattern Demonstration
 *
 * Isolates critical resources for resilience
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== BulkheadIsolation Pattern Demo ===\n");

        // Create implementation
        BulkheadIsolationImpl implementation = new BulkheadIsolationImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
