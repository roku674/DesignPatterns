package Integration.MessageFilter;

/**
 * MessageFilter Pattern Demonstration
 *
 * Category: Message Routing
 *
 * Description:
 * Filters out unwanted messages from a channel
 *
 * Key Concepts:
 * - Enterprise integration pattern for messaging systems
 * - Enables loose coupling between distributed applications
 * - Supports asynchronous communication
 * - Provides reliability and scalability
 *
 * Real-world scenarios demonstrated:
 * 1. Spam filtering
 * 2. Priority filtering
 * 3. Content filtering
 * 4. Type filtering
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== MessageFilter Pattern Demo ===\n");

        // Initialize messaging infrastructure
        System.out.println("Initializing MessageFilter infrastructure...\n");

        // Scenario 1: Spam filtering
        System.out.println("--- Scenario 1: Spam filtering ---");
        demonstrateSpamfiltering();
        System.out.println();

        // Scenario 2: Priority filtering
        System.out.println("--- Scenario 2: Priority filtering ---");
        demonstratePriorityfiltering();
        System.out.println();

        // Scenario 3: Content filtering
        System.out.println("--- Scenario 3: Content filtering ---");
        demonstrateContentfiltering();
        System.out.println();

        // Scenario 4: Type filtering
        System.out.println("--- Scenario 4: Type filtering ---");
        demonstrateTypefiltering();
        System.out.println();

        System.out.println("=== Pattern demonstration complete ===");
    }

    /**
     * Demonstrates Spam filtering.
     */
    private static void demonstrateSpamfiltering() {
        System.out.println("Setting up Spam filtering scenario...");

        // Create pattern-specific components
        MessageFilterImplementation implementation = new MessageFilterImplementation();

        // Execute scenario
        implementation.processScenario("Spam filtering");

        System.out.println("Spam filtering completed successfully!");
    }

    /**
     * Demonstrates Priority filtering.
     */
    private static void demonstratePriorityfiltering() {
        System.out.println("Setting up Priority filtering scenario...");

        // Create pattern-specific components
        MessageFilterImplementation implementation = new MessageFilterImplementation();

        // Execute scenario
        implementation.processScenario("Priority filtering");

        System.out.println("Priority filtering completed successfully!");
    }

    /**
     * Demonstrates Content filtering.
     */
    private static void demonstrateContentfiltering() {
        System.out.println("Setting up Content filtering scenario...");

        // Create pattern-specific components
        MessageFilterImplementation implementation = new MessageFilterImplementation();

        // Execute scenario
        implementation.processScenario("Content filtering");

        System.out.println("Content filtering completed successfully!");
    }

    /**
     * Demonstrates Type filtering.
     */
    private static void demonstrateTypefiltering() {
        System.out.println("Setting up Type filtering scenario...");

        // Create pattern-specific components
        MessageFilterImplementation implementation = new MessageFilterImplementation();

        // Execute scenario
        implementation.processScenario("Type filtering");

        System.out.println("Type filtering completed successfully!");
    }

}
