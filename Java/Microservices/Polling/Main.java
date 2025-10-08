package Microservices.Polling;

/**
 * Polling Pattern Demonstration
 *
 * Periodically polls for changes
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Polling Pattern Demo ===\n");

        // Create implementation
        PollingImpl implementation = new PollingImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
