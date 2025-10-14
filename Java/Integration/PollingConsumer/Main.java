package Integration.PollingConsumer;

import java.util.*;
import java.time.Instant;
import java.util.concurrent.*;

/**
 * PollingConsumer Pattern - Enterprise Integration Pattern
 *
 * Category: Message Endpoints
 *
 * Intent:
 * Consumer explicitly polls for messages rather than event-driven receipt
 *
 * Key Concepts:
 * - Pull-based message receipt
 * - Application controls polling
 * - Supports batch processing
 * - Enables flow control
 *
 * When to Use:
 * - You need to implement consumer explicitly polls for messages rather than event-driven receipt
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
 * 1. Batch processing: Poll for batch of messages
 * 2. Scheduled processing: Poll on schedule
 * 3. Rate-limited processing: Control processing rate
 * 4. Resource-constrained: Poll when resources available
 * 5. Manual processing: Explicit message retrieval
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 *
 * @author Enterprise Integration Patterns
 * @version 1.0
 */
public class Main {

    private static final String PATTERN_NAME = "PollingConsumer";
    private static int scenarioCounter = 0;

    public static void main(String[] args) {
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  " + PATTERN_NAME + " Pattern Demonstration" + " ".repeat(70 - PATTERN_NAME.length() - 32) + "║");
        System.out.println("║  Category: Message Endpoints" + " ".repeat(70 - 13 - len(category)) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
        System.out.println();

        // Pattern description
        System.out.println("Description:");
        System.out.println("  Consumer explicitly polls for messages rather than event-driven receipt");
        System.out.println();

        // Initialize the pattern
        System.out.println("Initializing PollingConsumer infrastructure...");
        PollingConsumerImplementation implementation = new PollingConsumerImplementation();
        System.out.println("  ✓ Infrastructure initialized");
        System.out.println();

        // Scenario 1: Batch processing
        demonstrateScenario("Batch processing", "Poll for batch of messages", implementation);

        // Scenario 2: Scheduled processing
        demonstrateScenario("Scheduled processing", "Poll on schedule", implementation);

        // Scenario 3: Rate-limited processing
        demonstrateScenario("Rate-limited processing", "Control processing rate", implementation);

        // Scenario 4: Resource-constrained
        demonstrateScenario("Resource-constrained", "Poll when resources available", implementation);

        // Scenario 5: Manual processing
        demonstrateScenario("Manual processing", "Explicit message retrieval", implementation);

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
            PollingConsumerImplementation implementation) {

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
