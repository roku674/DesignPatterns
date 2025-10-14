package Integration.Resequencer;

import java.util.*;
import java.time.Instant;
import java.util.concurrent.*;

/**
 * Resequencer Pattern - Enterprise Integration Pattern
 *
 * Category: Message Routing
 *
 * Intent:
 * Converts a stream of out-of-sequence messages back into correct order
 *
 * Key Concepts:
 * - Reorders out-of-sequence messages
 * - Uses sequence numbers
 * - Buffers messages until in order
 * - Handles missing messages
 *
 * When to Use:
 * - You need to implement converts a stream of out-of-sequence messages back into correct order
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
 * 1. Network packets: Reorder TCP packets
 * 2. Event ordering: Maintain event sequence
 * 3. Transaction logs: Reorder log entries
 * 4. Video frames: Reorder streaming frames
 * 5. Database changes: Maintain change order
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 *
 * @author Enterprise Integration Patterns
 * @version 1.0
 */
public class Main {

    private static final String PATTERN_NAME = "Resequencer";
    private static int scenarioCounter = 0;

    public static void main(String[] args) {
        System.out.println("╔" + "═".repeat(70) + "╗");
        System.out.println("║  " + PATTERN_NAME + " Pattern Demonstration" + " ".repeat(70 - PATTERN_NAME.length() - 32) + "║");
        System.out.println("║  Category: Message Routing" + " ".repeat(70 - 13 - len(category)) + "║");
        System.out.println("╚" + "═".repeat(70) + "╝");
        System.out.println();

        // Pattern description
        System.out.println("Description:");
        System.out.println("  Converts a stream of out-of-sequence messages back into correct order");
        System.out.println();

        // Initialize the pattern
        System.out.println("Initializing Resequencer infrastructure...");
        ResequencerImplementation implementation = new ResequencerImplementation();
        System.out.println("  ✓ Infrastructure initialized");
        System.out.println();

        // Scenario 1: Network packets
        demonstrateScenario("Network packets", "Reorder TCP packets", implementation);

        // Scenario 2: Event ordering
        demonstrateScenario("Event ordering", "Maintain event sequence", implementation);

        // Scenario 3: Transaction logs
        demonstrateScenario("Transaction logs", "Reorder log entries", implementation);

        // Scenario 4: Video frames
        demonstrateScenario("Video frames", "Reorder streaming frames", implementation);

        // Scenario 5: Database changes
        demonstrateScenario("Database changes", "Maintain change order", implementation);

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
            ResequencerImplementation implementation) {

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
