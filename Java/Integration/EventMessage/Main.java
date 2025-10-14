package Integration.EventMessage;

/**
 * EventMessage Pattern Demonstration
 *
 * Category: Message Construction
 *
 * Description:
 * Notifies other applications of state changes or occurrences
 *
 * Key Concepts:
 * - Enterprise integration pattern for messaging systems
 * - Enables loose coupling between distributed applications
 * - Supports asynchronous communication
 * - Provides reliability and scalability
 *
 * Real-world scenarios demonstrated:
 * 1. Order placed event
 * 2. User registered event
 * 3. Payment completed
 * 4. Inventory low alert
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== EventMessage Pattern Demo ===\n");

        // Initialize messaging infrastructure
        System.out.println("Initializing EventMessage infrastructure...\n");

        // Scenario 1: Order placed event
        System.out.println("--- Scenario 1: Order placed event ---");
        demonstrateOrderplacedevent();
        System.out.println();

        // Scenario 2: User registered event
        System.out.println("--- Scenario 2: User registered event ---");
        demonstrateUserregisteredevent();
        System.out.println();

        // Scenario 3: Payment completed
        System.out.println("--- Scenario 3: Payment completed ---");
        demonstratePaymentcompleted();
        System.out.println();

        // Scenario 4: Inventory low alert
        System.out.println("--- Scenario 4: Inventory low alert ---");
        demonstrateInventorylowalert();
        System.out.println();

        System.out.println("=== Pattern demonstration complete ===");
    }

    /**
     * Demonstrates Order placed event.
     */
    private static void demonstrateOrderplacedevent() {
        System.out.println("Setting up Order placed event scenario...");

        // Create pattern-specific components
        EventMessageImplementation implementation = new EventMessageImplementation();

        // Execute scenario
        implementation.processScenario("Order placed event");

        System.out.println("Order placed event completed successfully!");
    }

    /**
     * Demonstrates User registered event.
     */
    private static void demonstrateUserregisteredevent() {
        System.out.println("Setting up User registered event scenario...");

        // Create pattern-specific components
        EventMessageImplementation implementation = new EventMessageImplementation();

        // Execute scenario
        implementation.processScenario("User registered event");

        System.out.println("User registered event completed successfully!");
    }

    /**
     * Demonstrates Payment completed.
     */
    private static void demonstratePaymentcompleted() {
        System.out.println("Setting up Payment completed scenario...");

        // Create pattern-specific components
        EventMessageImplementation implementation = new EventMessageImplementation();

        // Execute scenario
        implementation.processScenario("Payment completed");

        System.out.println("Payment completed completed successfully!");
    }

    /**
     * Demonstrates Inventory low alert.
     */
    private static void demonstrateInventorylowalert() {
        System.out.println("Setting up Inventory low alert scenario...");

        // Create pattern-specific components
        EventMessageImplementation implementation = new EventMessageImplementation();

        // Execute scenario
        implementation.processScenario("Inventory low alert");

        System.out.println("Inventory low alert completed successfully!");
    }

}
