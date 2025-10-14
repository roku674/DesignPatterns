package Integration.MessageExpiration;

/**
 * MessageExpiration Pattern Demonstration
 *
 * Category: Message Construction
 *
 * Description:
 * Sets time-to-live for messages to prevent stale data
 *
 * Key Concepts:
 * - Enterprise integration pattern for messaging systems
 * - Enables loose coupling between distributed applications
 * - Supports asynchronous communication
 * - Provides reliability and scalability
 *
 * Real-world scenarios demonstrated:
 * 1. Flash sale notifications
 * 2. Stock quotes
 * 3. Session tokens
 * 4. Time-sensitive offers
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== MessageExpiration Pattern Demo ===\n");

        // Initialize messaging infrastructure
        System.out.println("Initializing MessageExpiration infrastructure...\n");

        // Scenario 1: Flash sale notifications
        System.out.println("--- Scenario 1: Flash sale notifications ---");
        demonstrateFlashsalenotifications();
        System.out.println();

        // Scenario 2: Stock quotes
        System.out.println("--- Scenario 2: Stock quotes ---");
        demonstrateStockquotes();
        System.out.println();

        // Scenario 3: Session tokens
        System.out.println("--- Scenario 3: Session tokens ---");
        demonstrateSessiontokens();
        System.out.println();

        // Scenario 4: Time-sensitive offers
        System.out.println("--- Scenario 4: Time-sensitive offers ---");
        demonstrateTimesensitiveoffers();
        System.out.println();

        System.out.println("=== Pattern demonstration complete ===");
    }

    /**
     * Demonstrates Flash sale notifications.
     */
    private static void demonstrateFlashsalenotifications() {
        System.out.println("Setting up Flash sale notifications scenario...");

        // Create pattern-specific components
        MessageExpirationImplementation implementation = new MessageExpirationImplementation();

        // Execute scenario
        implementation.processScenario("Flash sale notifications");

        System.out.println("Flash sale notifications completed successfully!");
    }

    /**
     * Demonstrates Stock quotes.
     */
    private static void demonstrateStockquotes() {
        System.out.println("Setting up Stock quotes scenario...");

        // Create pattern-specific components
        MessageExpirationImplementation implementation = new MessageExpirationImplementation();

        // Execute scenario
        implementation.processScenario("Stock quotes");

        System.out.println("Stock quotes completed successfully!");
    }

    /**
     * Demonstrates Session tokens.
     */
    private static void demonstrateSessiontokens() {
        System.out.println("Setting up Session tokens scenario...");

        // Create pattern-specific components
        MessageExpirationImplementation implementation = new MessageExpirationImplementation();

        // Execute scenario
        implementation.processScenario("Session tokens");

        System.out.println("Session tokens completed successfully!");
    }

    /**
     * Demonstrates Time-sensitive offers.
     */
    private static void demonstrateTimesensitiveoffers() {
        System.out.println("Setting up Time-sensitive offers scenario...");

        // Create pattern-specific components
        MessageExpirationImplementation implementation = new MessageExpirationImplementation();

        // Execute scenario
        implementation.processScenario("Time-sensitive offers");

        System.out.println("Time-sensitive offers completed successfully!");
    }

}
