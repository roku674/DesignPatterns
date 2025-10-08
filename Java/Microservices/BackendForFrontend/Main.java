package Microservices.BackendForFrontend;

/**
 * BackendForFrontend Pattern Demonstration
 *
 * Creates separate backends for different clients
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== BackendForFrontend Pattern Demo ===\n");

        // Create implementation
        BackendForFrontendImpl implementation = new BackendForFrontendImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
