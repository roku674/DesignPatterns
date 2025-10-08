package Integration.MessageStore;

/**
 * MessageStore Pattern Demonstration
 *
 * Stores messages for future retrieval
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== MessageStore Pattern Demo ===\n");

        // Create implementation
        MessageStoreImpl implementation = new MessageStoreImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
