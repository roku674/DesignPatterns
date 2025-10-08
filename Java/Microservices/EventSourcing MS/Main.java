package Microservices.EventSourcing MS;

/**
 * EventSourcing MS Pattern Demonstration
 *
 * Implements the EventSourcing MS pattern
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== EventSourcing MS Pattern Demo ===\n");

        // Create implementation
        EventSourcing MSImpl implementation = new EventSourcing MSImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
