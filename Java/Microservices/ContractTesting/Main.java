package Microservices.ContractTesting;

/**
 * ContractTesting Pattern Demonstration
 *
 * Tests service contracts independently
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ContractTesting Pattern Demo ===\n");

        // Create implementation
        ContractTestingImpl implementation = new ContractTestingImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
