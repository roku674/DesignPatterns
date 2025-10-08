package Microservices.Saga;

/**
 * Saga Pattern Demonstration
 *
 * Manages distributed transactions across microservices
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Saga Pattern Demo ===\n");

        // Create implementation
        SagaImpl implementation = new SagaImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
