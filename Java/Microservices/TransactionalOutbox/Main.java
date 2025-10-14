package Microservices.TransactionalOutbox;

/**
 * TransactionalOutbox Pattern Demonstration
 *
 * Publishes events as part of database transaction
 *
 * This implementation demonstrates the TransactionalOutbox pattern
 * in a microservices architecture context.
 *
 * @author Design Patterns Implementation
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== TransactionalOutbox Pattern Demo ===\n");

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
        System.out.println("1. Basic TransactionalOutbox Usage");
        System.out.println("-".repeat(50));

        TransactionalOutboxImplementation impl = new TransactionalOutboxImplementation();
        impl.executeBasic();
        System.out.println();
    }

    private static void demonstrateAdvancedUsage() {
        System.out.println("2. Advanced TransactionalOutbox Usage");
        System.out.println("-".repeat(50));

        TransactionalOutboxImplementation impl = new TransactionalOutboxImplementation();
        impl.executeAdvanced();
        System.out.println();
    }

    private static void demonstrateErrorHandling() {
        System.out.println("3. Error Handling");
        System.out.println("-".repeat(50));

        TransactionalOutboxImplementation impl = new TransactionalOutboxImplementation();
        impl.demonstrateErrorHandling();
        System.out.println();
    }

    private static void demonstratePerformanceOptimization() {
        System.out.println("4. Performance Optimization");
        System.out.println("-".repeat(50));

        TransactionalOutboxImplementation impl = new TransactionalOutboxImplementation();
        impl.demonstratePerformance();
        System.out.println();
    }

    private static void demonstrateRealWorldScenario() {
        System.out.println("5. Real-World Scenario");
        System.out.println("-".repeat(50));

        TransactionalOutboxImplementation impl = new TransactionalOutboxImplementation();
        impl.demonstrateRealWorld();
        System.out.println();
    }
}
