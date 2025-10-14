package Integration.PublishSubscribeChannel;

/**
 * PublishSubscribeChannel Pattern Demonstration
 *
 * Category: Message Channels
 *
 * Description:
 * Broadcasts messages to all interested subscribers
 *
 * Key Concepts:
 * - Enterprise integration pattern for messaging systems
 * - Enables loose coupling between distributed applications
 * - Supports asynchronous communication
 * - Provides reliability and scalability
 *
 * Real-world scenarios demonstrated:
 * 1. Price updates
 * 2. News feed
 * 3. Event notifications
 * 4. System alerts
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== PublishSubscribeChannel Pattern Demo ===\n");

        // Initialize messaging infrastructure
        System.out.println("Initializing PublishSubscribeChannel infrastructure...\n");

        // Scenario 1: Price updates
        System.out.println("--- Scenario 1: Price updates ---");
        demonstratePriceupdates();
        System.out.println();

        // Scenario 2: News feed
        System.out.println("--- Scenario 2: News feed ---");
        demonstrateNewsfeed();
        System.out.println();

        // Scenario 3: Event notifications
        System.out.println("--- Scenario 3: Event notifications ---");
        demonstrateEventnotifications();
        System.out.println();

        // Scenario 4: System alerts
        System.out.println("--- Scenario 4: System alerts ---");
        demonstrateSystemalerts();
        System.out.println();

        System.out.println("=== Pattern demonstration complete ===");
    }

    /**
     * Demonstrates Price updates.
     */
    private static void demonstratePriceupdates() {
        System.out.println("Setting up Price updates scenario...");

        // Create pattern-specific components
        PublishSubscribeChannelImplementation implementation = new PublishSubscribeChannelImplementation();

        // Execute scenario
        implementation.processScenario("Price updates");

        System.out.println("Price updates completed successfully!");
    }

    /**
     * Demonstrates News feed.
     */
    private static void demonstrateNewsfeed() {
        System.out.println("Setting up News feed scenario...");

        // Create pattern-specific components
        PublishSubscribeChannelImplementation implementation = new PublishSubscribeChannelImplementation();

        // Execute scenario
        implementation.processScenario("News feed");

        System.out.println("News feed completed successfully!");
    }

    /**
     * Demonstrates Event notifications.
     */
    private static void demonstrateEventnotifications() {
        System.out.println("Setting up Event notifications scenario...");

        // Create pattern-specific components
        PublishSubscribeChannelImplementation implementation = new PublishSubscribeChannelImplementation();

        // Execute scenario
        implementation.processScenario("Event notifications");

        System.out.println("Event notifications completed successfully!");
    }

    /**
     * Demonstrates System alerts.
     */
    private static void demonstrateSystemalerts() {
        System.out.println("Setting up System alerts scenario...");

        // Create pattern-specific components
        PublishSubscribeChannelImplementation implementation = new PublishSubscribeChannelImplementation();

        // Execute scenario
        implementation.processScenario("System alerts");

        System.out.println("System alerts completed successfully!");
    }

}
