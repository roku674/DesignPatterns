package Integration.DeadLetterChannel;

/**
 * DeadLetterChannel Pattern Demonstration
 *
 * Stores undeliverable messages
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== DeadLetterChannel Pattern Demo ===\n");

        // Create implementation
        DeadLetterChannelImpl implementation = new DeadLetterChannelImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
