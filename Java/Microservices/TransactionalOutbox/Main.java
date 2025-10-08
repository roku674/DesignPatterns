package Microservices.TransactionalOutbox;

/**
 * TransactionalOutbox Pattern Demonstration
 *
 * Reliably publishes events using outbox pattern
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== TransactionalOutbox Pattern Demo ===\n");

        // Create implementation
        TransactionalOutboxImpl implementation = new TransactionalOutboxImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
