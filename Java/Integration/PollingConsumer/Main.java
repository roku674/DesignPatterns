package Integration.PollingConsumer;

/**
 * PollingConsumer Pattern Demonstration
 *
 * Explicitly polls for messages
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== PollingConsumer Pattern Demo ===\n");

        // Create implementation
        PollingConsumerImpl implementation = new PollingConsumerImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
