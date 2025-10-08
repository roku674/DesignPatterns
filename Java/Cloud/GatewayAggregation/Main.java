package Cloud.GatewayAggregation;

/**
 * GatewayAggregation Pattern Demonstration
 *
 * Aggregates requests to multiple services
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== GatewayAggregation Pattern Demo ===\n");

        // Create implementation
        GatewayAggregationImpl implementation = new GatewayAggregationImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
