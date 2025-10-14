package Integration.MessageRouter;

/**
 * MessageRouter Pattern Demonstration
 *
 * Category: Message Routing
 *
 * Description:
 * Routes messages to different destinations based on conditions
 *
 * Key Concepts:
 * - Enterprise integration pattern for messaging systems
 * - Enables loose coupling between distributed applications
 * - Supports asynchronous communication
 * - Provides reliability and scalability
 *
 * Real-world scenarios demonstrated:
 * 1. Conditional routing
 * 2. Multi-destination routing
 * 3. Filter-based routing
 * 4. Priority routing
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== MessageRouter Pattern Demo ===\n");

        // Initialize messaging infrastructure
        System.out.println("Initializing MessageRouter infrastructure...\n");

        // Scenario 1: Conditional routing
        System.out.println("--- Scenario 1: Conditional routing ---");
        demonstrateConditionalrouting();
        System.out.println();

        // Scenario 2: Multi-destination routing
        System.out.println("--- Scenario 2: Multi-destination routing ---");
        demonstrateMultidestinationrouting();
        System.out.println();

        // Scenario 3: Filter-based routing
        System.out.println("--- Scenario 3: Filter-based routing ---");
        demonstrateFilterbasedrouting();
        System.out.println();

        // Scenario 4: Priority routing
        System.out.println("--- Scenario 4: Priority routing ---");
        demonstratePriorityrouting();
        System.out.println();

        System.out.println("=== Pattern demonstration complete ===");
    }

    /**
     * Demonstrates Conditional routing.
     */
    private static void demonstrateConditionalrouting() {
        System.out.println("Setting up Conditional routing scenario...");

        // Create pattern-specific components
        MessageRouterImplementation implementation = new MessageRouterImplementation();

        // Execute scenario
        implementation.processScenario("Conditional routing");

        System.out.println("Conditional routing completed successfully!");
    }

    /**
     * Demonstrates Multi-destination routing.
     */
    private static void demonstrateMultidestinationrouting() {
        System.out.println("Setting up Multi-destination routing scenario...");

        // Create pattern-specific components
        MessageRouterImplementation implementation = new MessageRouterImplementation();

        // Execute scenario
        implementation.processScenario("Multi-destination routing");

        System.out.println("Multi-destination routing completed successfully!");
    }

    /**
     * Demonstrates Filter-based routing.
     */
    private static void demonstrateFilterbasedrouting() {
        System.out.println("Setting up Filter-based routing scenario...");

        // Create pattern-specific components
        MessageRouterImplementation implementation = new MessageRouterImplementation();

        // Execute scenario
        implementation.processScenario("Filter-based routing");

        System.out.println("Filter-based routing completed successfully!");
    }

    /**
     * Demonstrates Priority routing.
     */
    private static void demonstratePriorityrouting() {
        System.out.println("Setting up Priority routing scenario...");

        // Create pattern-specific components
        MessageRouterImplementation implementation = new MessageRouterImplementation();

        // Execute scenario
        implementation.processScenario("Priority routing");

        System.out.println("Priority routing completed successfully!");
    }

}
