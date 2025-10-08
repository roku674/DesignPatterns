package Cloud.Bulkhead;

/**
 * Bulkhead Pattern Demonstration
 *
 * Isolates elements to prevent cascade failures
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Bulkhead Pattern Demo ===\n");

        // Create implementation
        BulkheadImpl implementation = new BulkheadImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
