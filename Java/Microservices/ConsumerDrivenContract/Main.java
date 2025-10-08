package Microservices.ConsumerDrivenContract;

/**
 * ConsumerDrivenContract Pattern Demonstration
 *
 * Consumers define contract expectations
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ConsumerDrivenContract Pattern Demo ===\n");

        // Create implementation
        ConsumerDrivenContractImpl implementation = new ConsumerDrivenContractImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
