package Enterprise.Gateway;

/**
 * Gateway Pattern Demonstration
 *
 * Encapsulates access to an external system or resource
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Gateway Pattern Demo ===\n");

        // Create implementation
        GatewayImpl implementation = new GatewayImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
