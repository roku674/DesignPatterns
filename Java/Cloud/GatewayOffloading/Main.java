package Cloud.GatewayOffloading;

/**
 * GatewayOffloading Pattern Demonstration
 *
 * Offloads shared functionality to a gateway proxy
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== GatewayOffloading Pattern Demo ===\n");

        // Create implementation
        GatewayOffloadingImpl implementation = new GatewayOffloadingImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
