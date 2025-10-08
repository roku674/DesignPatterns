package Integration.MessageFilter;

/**
 * MessageFilter Pattern Demonstration
 *
 * Removes unwanted messages from channel
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== MessageFilter Pattern Demo ===\n");

        // Create implementation
        MessageFilterImpl implementation = new MessageFilterImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
