package Microservices.Strangler;

/**
 * Strangler Pattern Demonstration
 *
 * Incrementally replaces legacy system
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Strangler Pattern Demo ===\n");

        // Create implementation
        StranglerImpl implementation = new StranglerImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
