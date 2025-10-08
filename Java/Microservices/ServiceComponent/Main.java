package Microservices.ServiceComponent;

/**
 * ServiceComponent Pattern Demonstration
 *
 * Tests service in isolation
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ServiceComponent Pattern Demo ===\n");

        // Create implementation
        ServiceComponentImpl implementation = new ServiceComponentImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
