package Integration.MessageBus;

/**
 * MessageBus Pattern Demonstration
 *
 * Enables separate applications to work together
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== MessageBus Pattern Demo ===\n");

        // Create implementation
        MessageBusImpl implementation = new MessageBusImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
