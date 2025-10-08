package Integration.MessagingGateway;

/**
 * MessagingGateway Pattern Demonstration
 *
 * Encapsulates access to messaging system
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== MessagingGateway Pattern Demo ===\n");

        // Create implementation
        MessagingGatewayImpl implementation = new MessagingGatewayImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
