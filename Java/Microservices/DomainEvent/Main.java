package Microservices.DomainEvent;

/**
 * DomainEvent Pattern Demonstration
 *
 * Uses events to communicate state changes
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== DomainEvent Pattern Demo ===\n");

        // Create implementation
        DomainEventImpl implementation = new DomainEventImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
