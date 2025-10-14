package Integration.InvalidMessageChannel;

/**
 * InvalidMessageChannel Pattern Demonstration
 *
 * Category: Message Channels
 *
 * Description:
 * Routes invalid messages for special handling
 *
 * Key Concepts:
 * - Enterprise integration pattern for messaging systems
 * - Enables loose coupling between distributed applications
 * - Supports asynchronous communication
 * - Provides reliability and scalability
 *
 * Real-world scenarios demonstrated:
 * 1. Validation failures
 * 2. Malformed messages
 * 3. Schema violations
 * 4. Parse errors
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== InvalidMessageChannel Pattern Demo ===\n");

        // Initialize messaging infrastructure
        System.out.println("Initializing InvalidMessageChannel infrastructure...\n");

        // Scenario 1: Validation failures
        System.out.println("--- Scenario 1: Validation failures ---");
        demonstrateValidationfailures();
        System.out.println();

        // Scenario 2: Malformed messages
        System.out.println("--- Scenario 2: Malformed messages ---");
        demonstrateMalformedmessages();
        System.out.println();

        // Scenario 3: Schema violations
        System.out.println("--- Scenario 3: Schema violations ---");
        demonstrateSchemaviolations();
        System.out.println();

        // Scenario 4: Parse errors
        System.out.println("--- Scenario 4: Parse errors ---");
        demonstrateParseerrors();
        System.out.println();

        System.out.println("=== Pattern demonstration complete ===");
    }

    /**
     * Demonstrates Validation failures.
     */
    private static void demonstrateValidationfailures() {
        System.out.println("Setting up Validation failures scenario...");

        // Create pattern-specific components
        InvalidMessageChannelImplementation implementation = new InvalidMessageChannelImplementation();

        // Execute scenario
        implementation.processScenario("Validation failures");

        System.out.println("Validation failures completed successfully!");
    }

    /**
     * Demonstrates Malformed messages.
     */
    private static void demonstrateMalformedmessages() {
        System.out.println("Setting up Malformed messages scenario...");

        // Create pattern-specific components
        InvalidMessageChannelImplementation implementation = new InvalidMessageChannelImplementation();

        // Execute scenario
        implementation.processScenario("Malformed messages");

        System.out.println("Malformed messages completed successfully!");
    }

    /**
     * Demonstrates Schema violations.
     */
    private static void demonstrateSchemaviolations() {
        System.out.println("Setting up Schema violations scenario...");

        // Create pattern-specific components
        InvalidMessageChannelImplementation implementation = new InvalidMessageChannelImplementation();

        // Execute scenario
        implementation.processScenario("Schema violations");

        System.out.println("Schema violations completed successfully!");
    }

    /**
     * Demonstrates Parse errors.
     */
    private static void demonstrateParseerrors() {
        System.out.println("Setting up Parse errors scenario...");

        // Create pattern-specific components
        InvalidMessageChannelImplementation implementation = new InvalidMessageChannelImplementation();

        // Execute scenario
        implementation.processScenario("Parse errors");

        System.out.println("Parse errors completed successfully!");
    }

}
