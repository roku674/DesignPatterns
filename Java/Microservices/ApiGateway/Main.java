package Microservices.ApiGateway;

/**
 * ApiGateway Pattern Demonstration
 *
 * Routes client requests to appropriate microservices, handles cross-cutting concerns
 *
 * This implementation demonstrates the ApiGateway pattern
 * in a microservices architecture context.
 *
 * @author Design Patterns Implementation
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ApiGateway Pattern Demo ===\n");

        // Scenario 1: Basic implementation
        demonstrateBasicUsage();

        // Scenario 2: Advanced usage
        demonstrateAdvancedUsage();

        // Scenario 3: Error handling
        demonstrateErrorHandling();

        // Scenario 4: Performance optimization
        demonstratePerformanceOptimization();

        // Scenario 5: Real-world scenario
        demonstrateRealWorldScenario();

        System.out.println("\n=== Pattern demonstration complete ===");
    }

    private static void demonstrateBasicUsage() {
        System.out.println("1. Basic ApiGateway Usage");
        System.out.println("-".repeat(50));

        ApiGatewayImplementation impl = new ApiGatewayImplementation();
        impl.executeBasic();
        System.out.println();
    }

    private static void demonstrateAdvancedUsage() {
        System.out.println("2. Advanced ApiGateway Usage");
        System.out.println("-".repeat(50));

        ApiGatewayImplementation impl = new ApiGatewayImplementation();
        impl.executeAdvanced();
        System.out.println();
    }

    private static void demonstrateErrorHandling() {
        System.out.println("3. Error Handling");
        System.out.println("-".repeat(50));

        ApiGatewayImplementation impl = new ApiGatewayImplementation();
        impl.demonstrateErrorHandling();
        System.out.println();
    }

    private static void demonstratePerformanceOptimization() {
        System.out.println("4. Performance Optimization");
        System.out.println("-".repeat(50));

        ApiGatewayImplementation impl = new ApiGatewayImplementation();
        impl.demonstratePerformance();
        System.out.println();
    }

    private static void demonstrateRealWorldScenario() {
        System.out.println("5. Real-World Scenario");
        System.out.println("-".repeat(50));

        ApiGatewayImplementation impl = new ApiGatewayImplementation();
        impl.demonstrateRealWorld();
        System.out.println();
    }
}
