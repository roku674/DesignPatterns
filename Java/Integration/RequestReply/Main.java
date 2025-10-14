package Integration.RequestReply;

/**
 * RequestReply Pattern Demonstration
 *
 * Category: Message Construction
 *
 * Description:
 * Enables two-way messaging with request and corresponding reply
 *
 * Key Concepts:
 * - Enterprise integration pattern for messaging systems
 * - Enables loose coupling between distributed applications
 * - Supports asynchronous communication
 * - Provides reliability and scalability
 *
 * Real-world scenarios demonstrated:
 * 1. Query customer balance
 * 2. Validate credit card
 * 3. Get shipping quote
 * 4. Check inventory
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== RequestReply Pattern Demo ===\n");

        // Initialize messaging infrastructure
        System.out.println("Initializing RequestReply infrastructure...\n");

        // Scenario 1: Query customer balance
        System.out.println("--- Scenario 1: Query customer balance ---");
        demonstrateQuerycustomerbalance();
        System.out.println();

        // Scenario 2: Validate credit card
        System.out.println("--- Scenario 2: Validate credit card ---");
        demonstrateValidatecreditcard();
        System.out.println();

        // Scenario 3: Get shipping quote
        System.out.println("--- Scenario 3: Get shipping quote ---");
        demonstrateGetshippingquote();
        System.out.println();

        // Scenario 4: Check inventory
        System.out.println("--- Scenario 4: Check inventory ---");
        demonstrateCheckinventory();
        System.out.println();

        System.out.println("=== Pattern demonstration complete ===");
    }

    /**
     * Demonstrates Query customer balance.
     */
    private static void demonstrateQuerycustomerbalance() {
        System.out.println("Setting up Query customer balance scenario...");

        // Create pattern-specific components
        RequestReplyImplementation implementation = new RequestReplyImplementation();

        // Execute scenario
        implementation.processScenario("Query customer balance");

        System.out.println("Query customer balance completed successfully!");
    }

    /**
     * Demonstrates Validate credit card.
     */
    private static void demonstrateValidatecreditcard() {
        System.out.println("Setting up Validate credit card scenario...");

        // Create pattern-specific components
        RequestReplyImplementation implementation = new RequestReplyImplementation();

        // Execute scenario
        implementation.processScenario("Validate credit card");

        System.out.println("Validate credit card completed successfully!");
    }

    /**
     * Demonstrates Get shipping quote.
     */
    private static void demonstrateGetshippingquote() {
        System.out.println("Setting up Get shipping quote scenario...");

        // Create pattern-specific components
        RequestReplyImplementation implementation = new RequestReplyImplementation();

        // Execute scenario
        implementation.processScenario("Get shipping quote");

        System.out.println("Get shipping quote completed successfully!");
    }

    /**
     * Demonstrates Check inventory.
     */
    private static void demonstrateCheckinventory() {
        System.out.println("Setting up Check inventory scenario...");

        // Create pattern-specific components
        RequestReplyImplementation implementation = new RequestReplyImplementation();

        // Execute scenario
        implementation.processScenario("Check inventory");

        System.out.println("Check inventory completed successfully!");
    }

}
