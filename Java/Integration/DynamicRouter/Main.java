package Integration.DynamicRouter;

import java.util.*;
import java.time.Instant;
import java.util.concurrent.*;

/**
 * DynamicRouter Pattern - Enterprise Integration Pattern
 *
 * Category: Message Routing
 *
 * Intent:
 * Routes messages based on runtime configuration that can change dynamically
 *
 * Key Concepts:
 * - Routing rules can be modified at runtime
 * - Supports hot-reloading of routing configuration
 * - Enables A/B testing and gradual rollouts
 * - Allows runtime routing optimization
 *
 * When to Use:
 * - You need to implement routes messages based on runtime configuration that can change dynamically
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
 * 1. Feature flags: Route to new service version based on flags
 * 2. Load balancing: Dynamic routing based on server load
 * 3. Maintenance mode: Route around services under maintenance
 * 4. A/B testing: Route percentage of traffic to test version
 * 5. Geographic routing: Route based on user location
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 *
 * @author Enterprise Integration Patterns
 * @version 1.0
 */
public class Main {

    private static final String PATTERN_NAME = "DynamicRouter";
    private static int scenarioCounter = 0;

    public static void main(String[] args) {
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  " + PATTERN_NAME + " Pattern Demonstration" + " ".repeat(70 - PATTERN_NAME.length() - 32) + "║");
        System.out.println("║  Category: Message Routing" + " ".repeat(70 - 13 - len(category)) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
        System.out.println();

        // Pattern description
        System.out.println("Description:");
        System.out.println("  Routes messages based on runtime configuration that can change dynamically");
        System.out.println();

        // Initialize the pattern
        System.out.println("Initializing DynamicRouter infrastructure...");
        DynamicRouterImplementation implementation = new DynamicRouterImplementation();
        System.out.println("  ✓ Infrastructure initialized");
        System.out.println();

        // Scenario 1: Feature flags
        demonstrateScenario("Feature flags", "Route to new service version based on flags", implementation);

        // Scenario 2: Load balancing
        demonstrateScenario("Load balancing", "Dynamic routing based on server load", implementation);

        // Scenario 3: Maintenance mode
        demonstrateScenario("Maintenance mode", "Route around services under maintenance", implementation);

        // Scenario 4: A/B testing
        demonstrateScenario("A/B testing", "Route percentage of traffic to test version", implementation);

        // Scenario 5: Geographic routing
        demonstrateScenario("Geographic routing", "Route based on user location", implementation);

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
            DynamicRouterImplementation implementation) {

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
}}
