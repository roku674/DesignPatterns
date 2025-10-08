package Cloud.GatewayRouting;

/**
 * GatewayRouting Pattern Demonstration
 *
 * Routes requests to multiple services using single endpoint
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== GatewayRouting Pattern Demo ===\n");

        // Create implementation
        GatewayRoutingImpl implementation = new GatewayRoutingImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
