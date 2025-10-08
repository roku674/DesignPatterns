package Concurrency.Connector;

/**
 * Connector Pattern Demonstration
 *
 * Decouples active connection establishment from service processing
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Connector Pattern Demo ===\n");

        // Create implementation
        ConnectorImpl implementation = new ConnectorImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
