package Integration.PriorityChannel;

/**
 * PriorityChannel Pattern Demonstration
 *
 * Category: Message Channels
 *
 * Description:
 * Delivers higher priority messages before lower priority ones
 *
 * Key Concepts:
 * - Enterprise integration pattern for messaging systems
 * - Enables loose coupling between distributed applications
 * - Supports asynchronous communication
 * - Provides reliability and scalability
 *
 * Real-world scenarios demonstrated:
 * 1. Urgent order processing
 * 2. Critical alerts
 * 3. VIP customer requests
 * 4. Emergency notifications
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== PriorityChannel Pattern Demo ===\n");

        // Initialize messaging infrastructure
        System.out.println("Initializing PriorityChannel infrastructure...\n");

        // Scenario 1: Urgent order processing
        System.out.println("--- Scenario 1: Urgent order processing ---");
        demonstrateUrgentorderprocessing();
        System.out.println();

        // Scenario 2: Critical alerts
        System.out.println("--- Scenario 2: Critical alerts ---");
        demonstrateCriticalalerts();
        System.out.println();

        // Scenario 3: VIP customer requests
        System.out.println("--- Scenario 3: VIP customer requests ---");
        demonstrateVIPcustomerrequests();
        System.out.println();

        // Scenario 4: Emergency notifications
        System.out.println("--- Scenario 4: Emergency notifications ---");
        demonstrateEmergencynotifications();
        System.out.println();

        System.out.println("=== Pattern demonstration complete ===");
    }

    /**
     * Demonstrates Urgent order processing.
     */
    private static void demonstrateUrgentorderprocessing() {
        System.out.println("Setting up Urgent order processing scenario...");

        // Create pattern-specific components
        PriorityChannelImplementation implementation = new PriorityChannelImplementation();

        // Execute scenario
        implementation.processScenario("Urgent order processing");

        System.out.println("Urgent order processing completed successfully!");
    }

    /**
     * Demonstrates Critical alerts.
     */
    private static void demonstrateCriticalalerts() {
        System.out.println("Setting up Critical alerts scenario...");

        // Create pattern-specific components
        PriorityChannelImplementation implementation = new PriorityChannelImplementation();

        // Execute scenario
        implementation.processScenario("Critical alerts");

        System.out.println("Critical alerts completed successfully!");
    }

    /**
     * Demonstrates VIP customer requests.
     */
    private static void demonstrateVIPcustomerrequests() {
        System.out.println("Setting up VIP customer requests scenario...");

        // Create pattern-specific components
        PriorityChannelImplementation implementation = new PriorityChannelImplementation();

        // Execute scenario
        implementation.processScenario("VIP customer requests");

        System.out.println("VIP customer requests completed successfully!");
    }

    /**
     * Demonstrates Emergency notifications.
     */
    private static void demonstrateEmergencynotifications() {
        System.out.println("Setting up Emergency notifications scenario...");

        // Create pattern-specific components
        PriorityChannelImplementation implementation = new PriorityChannelImplementation();

        // Execute scenario
        implementation.processScenario("Emergency notifications");

        System.out.println("Emergency notifications completed successfully!");
    }

}
