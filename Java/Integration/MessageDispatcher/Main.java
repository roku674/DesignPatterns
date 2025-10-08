package Integration.MessageDispatcher;

/**
 * MessageDispatcher Pattern Demonstration
 *
 * Distributes messages to consumers
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== MessageDispatcher Pattern Demo ===\n");

        // Create implementation
        MessageDispatcherImpl implementation = new MessageDispatcherImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
