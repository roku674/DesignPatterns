package Integration.InvalidMessageChannel;

/**
 * InvalidMessageChannel Pattern Demonstration
 *
 * Handles messages that cannot be processed
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== InvalidMessageChannel Pattern Demo ===\n");

        // Create implementation
        InvalidMessageChannelImpl implementation = new InvalidMessageChannelImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
