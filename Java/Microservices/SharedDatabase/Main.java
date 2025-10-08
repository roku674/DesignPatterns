package Microservices.SharedDatabase;

/**
 * SharedDatabase Pattern Demonstration
 *
 * Multiple services share a database
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== SharedDatabase Pattern Demo ===\n");

        // Create implementation
        SharedDatabaseImpl implementation = new SharedDatabaseImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
