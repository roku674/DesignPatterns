package Integration.MessagingBridge;

/**
 * MessagingBridge Pattern Demonstration
 *
 * Connects multiple messaging systems
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== MessagingBridge Pattern Demo ===\n");

        // Create implementation
        MessagingBridgeImpl implementation = new MessagingBridgeImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
