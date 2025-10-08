package Integration.MessageRouter;

/**
 * MessageRouter Pattern Demonstration
 *
 * Routes messages to different destinations
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== MessageRouter Pattern Demo ===\n");

        // Create implementation
        MessageRouterImpl implementation = new MessageRouterImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
