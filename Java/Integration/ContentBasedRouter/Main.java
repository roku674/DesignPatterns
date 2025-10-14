package Integration.ContentBasedRouter;

import java.util.*;
import java.time.Instant;
import java.util.concurrent.*;

/**
 * ContentBasedRouter Pattern - Enterprise Integration Pattern
 *
 * Category: Message Routing
 *
 * Intent:
 * Routes messages to different channels based on message content
 *
 * Key Concepts:
 * - Examines message content to determine routing destination
 * - Uses conditional logic to select output channel
 * - Decouples sender from routing logic
 * - Supports complex routing rules
 *
 * When to Use:
 * - You need to implement routes messages to different channels based on message content
 * - You want to decouple system components
 * - You require reliable message processing
 * - You need to scale message handling
 * - You want to maintain system flexibility
 *
 * Benefits:
 * - Loose coupling between components
 * - Scalable message processing
 * - Flexible system architecture
 * - Maintainable integration code
 * - Testable components
 *
 * Real-World Scenarios:
 * 1. High priority orders: Route urgent orders to express processing queue
 * 2. Regional distribution: Route orders to regional fulfillment centers
 * 3. Product category routing: Route products to category-specific handlers
 * 4. Customer tier routing: Route VIP customers to premium service
 * 5. Error routing: Route failed messages to error handling
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 *
 * @author Enterprise Integration Patterns
 * @version 1.0
 */
public class Main {

    private static final String PATTERN_NAME = "ContentBasedRouter";
    private static int scenarioCounter = 0;

    public static void main(String[] args) {
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  " + PATTERN_NAME + " Pattern Demonstration" + " ".repeat(70 - PATTERN_NAME.length() - 32) + "║");
        System.out.println("║  Category: Message Routing" + " ".repeat(70 - 13 - len(category)) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
        System.out.println();

        // Pattern description
        System.out.println("Description:");
        System.out.println("  Routes messages to different channels based on message content");
        System.out.println();

        // Initialize the pattern
        System.out.println("Initializing ContentBasedRouter infrastructure...");
        ContentBasedRouterImplementation implementation = new ContentBasedRouterImplementation();
        System.out.println("  ✓ Infrastructure initialized");
        System.out.println();

        // Scenario 1: High priority orders
        demonstrateScenario("High priority orders", "Route urgent orders to express processing queue", implementation);

        // Scenario 2: Regional distribution
        demonstrateScenario("Regional distribution", "Route orders to regional fulfillment centers", implementation);

        // Scenario 3: Product category routing
        demonstrateScenario("Product category routing", "Route products to category-specific handlers", implementation);

        // Scenario 4: Customer tier routing
        demonstrateScenario("Customer tier routing", "Route VIP customers to premium service", implementation);

        // Scenario 5: Error routing
        demonstrateScenario("Error routing", "Route failed messages to error handling", implementation);

        // Summary
        printSummary();

        System.out.println();
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  Pattern Demonstration Complete" + " ".repeat(70 - 34) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
    }

    /**
     * Demonstrates a specific scenario.
     */
    private static void demonstrateScenario(
            String scenarioName,
            String scenarioDescription,
            ContentBasedRouterImplementation implementation) {

        scenarioCounter++;
        System.out.println("─".repeat(72));
        System.out.println("Scenario " + scenarioCounter + ": " + scenarioName);
        System.out.println("─".repeat(72));
        System.out.println("Description: " + scenarioDescription);
        System.out.println();

        try {
            // Execute scenario
            long startTime = System.currentTimeMillis();

            implementation.processScenario(scenarioName, scenarioDescription);

            long endTime = System.currentTimeMillis();
            long duration = endTime - startTime;

            System.out.println();
            System.out.println("  ✓ Scenario completed successfully in " + duration + "ms");
            System.out.println();

        } catch (Exception e) {
            System.err.println("  ✗ Error in scenario: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Prints execution summary.
     */
    private static void printSummary() {
        System.out.println("─".repeat(72));
        System.out.println("Execution Summary");
        System.out.println("─".repeat(72));
        System.out.println("  Total scenarios executed: " + scenarioCounter);
        System.out.println("  Pattern: " + PATTERN_NAME);
        System.out.println("  Category: {category}");
        System.out.println("  Status: All scenarios completed");
        System.out.println("─".repeat(72));
    }

    /**
     * Helper to simulate processing delay.
     */
    private static void simulateProcessing(int milliseconds) {
        try {
            Thread.sleep(milliseconds);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    /**
     * Helper to print step information.
     */
    private static void printStep(String step) {
        System.out.println("  → " + step);
    }

    /**
     * Helper to print success message.
     */
    private static void printSuccess(String message) {
        System.out.println("  ✓ " + message);
    }

    /**
     * Helper to print info message.
     */
    private static void printInfo(String message) {
        System.out.println("  ℹ " + message);
    }
}
