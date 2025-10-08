package Microservices.EventDrivenArchitecture;

/**
 * EventDrivenArchitecture Pattern Demonstration
 *
 * Uses events for communication between services
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== EventDrivenArchitecture Pattern Demo ===\n");

        // Create implementation
        EventDrivenArchitectureImpl implementation = new EventDrivenArchitectureImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
