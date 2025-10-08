package Integration.ComposedMessageProcessor;

/**
 * ComposedMessageProcessor Pattern Demonstration
 *
 * Processes message consisting of multiple elements
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ComposedMessageProcessor Pattern Demo ===\n");

        // Create implementation
        ComposedMessageProcessorImpl implementation = new ComposedMessageProcessorImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
