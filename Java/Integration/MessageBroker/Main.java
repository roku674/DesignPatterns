package Integration.MessageBroker;

/**
 * MessageBroker Pattern Demonstration
 *
 * Decouples destination of message from sender
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== MessageBroker Pattern Demo ===\n");

        // Create implementation
        MessageBrokerImpl implementation = new MessageBrokerImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
