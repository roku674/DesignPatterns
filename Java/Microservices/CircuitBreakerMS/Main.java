package Microservices.CircuitBreakerMS;

/**
 * CircuitBreakerMS Pattern Demonstration
 *
 * Prevents cascading failures in microservices
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== CircuitBreakerMS Pattern Demo ===\n");

        // Create implementation
        CircuitBreakerMSImpl implementation = new CircuitBreakerMSImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
