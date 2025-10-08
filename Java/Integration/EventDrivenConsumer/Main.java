package Integration.EventDrivenConsumer;

/**
 * EventDrivenConsumer Pattern Demonstration
 *
 * Automatically consumes messages when available
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== EventDrivenConsumer Pattern Demo ===\n");

        // Create implementation
        EventDrivenConsumerImpl implementation = new EventDrivenConsumerImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
