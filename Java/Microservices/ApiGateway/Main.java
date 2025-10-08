package Microservices.ApiGateway;

/**
 * ApiGateway Pattern Demonstration
 *
 * Single entry point for all client requests
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ApiGateway Pattern Demo ===\n");

        // Create implementation
        ApiGatewayImpl implementation = new ApiGatewayImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
