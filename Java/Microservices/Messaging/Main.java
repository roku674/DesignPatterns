package Microservices.Messaging;

/**
 * Messaging Pattern Demonstration
 *
 * Uses async messaging for communication
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Messaging Pattern Demo ===\n");

        // Create implementation
        MessagingImpl implementation = new MessagingImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
