package Integration.Aggregator;

/**
 * Aggregator Pattern Demonstration
 *
 * Combines results of individual messages
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Aggregator Pattern Demo ===\n");

        // Create implementation
        AggregatorImpl implementation = new AggregatorImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
