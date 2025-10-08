package Integration.MessageExpiration;

/**
 * MessageExpiration Pattern Demonstration
 *
 * Sets expiration time for messages
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== MessageExpiration Pattern Demo ===\n");

        // Create implementation
        MessageExpirationImpl implementation = new MessageExpirationImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
