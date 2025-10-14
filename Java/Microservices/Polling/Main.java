package Microservices.Polling;

/**
 * Polling Pattern Demonstration
 *
 * Periodically polls database for changes
 *
 * This implementation demonstrates the Polling pattern
 * in a microservices architecture context.
 *
 * @author Design Patterns Implementation
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Polling Pattern Demo ===\n");

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
        System.out.println("1. Basic Polling Usage");
        System.out.println("-".repeat(50));

        PollingImplementation impl = new PollingImplementation();
        impl.executeBasic();
        System.out.println();
    }

    private static void demonstrateAdvancedUsage() {
        System.out.println("2. Advanced Polling Usage");
        System.out.println("-".repeat(50));

        PollingImplementation impl = new PollingImplementation();
        impl.executeAdvanced();
        System.out.println();
    }

    private static void demonstrateErrorHandling() {
        System.out.println("3. Error Handling");
        System.out.println("-".repeat(50));

        PollingImplementation impl = new PollingImplementation();
        impl.demonstrateErrorHandling();
        System.out.println();
    }

    private static void demonstratePerformanceOptimization() {
        System.out.println("4. Performance Optimization");
        System.out.println("-".repeat(50));

        PollingImplementation impl = new PollingImplementation();
        impl.demonstratePerformance();
        System.out.println();
    }

    private static void demonstrateRealWorldScenario() {
        System.out.println("5. Real-World Scenario");
        System.out.println("-".repeat(50));

        PollingImplementation impl = new PollingImplementation();
        impl.demonstrateRealWorld();
        System.out.println();
    }
}
