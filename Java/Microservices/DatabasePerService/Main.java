package Microservices.DatabasePerService;

/**
 * DatabasePerService Pattern Demonstration
 *
 * Each microservice has its own database
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== DatabasePerService Pattern Demo ===\n");

        // Create implementation
        DatabasePerServiceImpl implementation = new DatabasePerServiceImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
