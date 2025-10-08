package Integration.SelectiveConsumer;

/**
 * SelectiveConsumer Pattern Demonstration
 *
 * Filters messages at consumer
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== SelectiveConsumer Pattern Demo ===\n");

        // Create implementation
        SelectiveConsumerImpl implementation = new SelectiveConsumerImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
