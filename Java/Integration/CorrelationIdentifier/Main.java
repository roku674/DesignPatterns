package Integration.CorrelationIdentifier;

/**
 * CorrelationIdentifier Pattern Demonstration
 *
 * Category: Message Construction
 *
 * Description:
 * Matches request with corresponding reply using correlation ID
 *
 * Key Concepts:
 * - Enterprise integration pattern for messaging systems
 * - Enables loose coupling between distributed applications
 * - Supports asynchronous communication
 * - Provides reliability and scalability
 *
 * Real-world scenarios demonstrated:
 * 1. Track order status
 * 2. Match payments to invoices
 * 3. Link requests to responses
 * 4. Session tracking
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== CorrelationIdentifier Pattern Demo ===\n");

        // Initialize messaging infrastructure
        System.out.println("Initializing CorrelationIdentifier infrastructure...\n");

        // Scenario 1: Track order status
        System.out.println("--- Scenario 1: Track order status ---");
        demonstrateTrackorderstatus();
        System.out.println();

        // Scenario 2: Match payments to invoices
        System.out.println("--- Scenario 2: Match payments to invoices ---");
        demonstrateMatchpaymentstoinvoices();
        System.out.println();

        // Scenario 3: Link requests to responses
        System.out.println("--- Scenario 3: Link requests to responses ---");
        demonstrateLinkrequeststoresponses();
        System.out.println();

        // Scenario 4: Session tracking
        System.out.println("--- Scenario 4: Session tracking ---");
        demonstrateSessiontracking();
        System.out.println();

        System.out.println("=== Pattern demonstration complete ===");
    }

    /**
     * Demonstrates Track order status.
     */
    private static void demonstrateTrackorderstatus() {
        System.out.println("Setting up Track order status scenario...");

        // Create pattern-specific components
        CorrelationIdentifierImplementation implementation = new CorrelationIdentifierImplementation();

        // Execute scenario
        implementation.processScenario("Track order status");

        System.out.println("Track order status completed successfully!");
    }

    /**
     * Demonstrates Match payments to invoices.
     */
    private static void demonstrateMatchpaymentstoinvoices() {
        System.out.println("Setting up Match payments to invoices scenario...");

        // Create pattern-specific components
        CorrelationIdentifierImplementation implementation = new CorrelationIdentifierImplementation();

        // Execute scenario
        implementation.processScenario("Match payments to invoices");

        System.out.println("Match payments to invoices completed successfully!");
    }

    /**
     * Demonstrates Link requests to responses.
     */
    private static void demonstrateLinkrequeststoresponses() {
        System.out.println("Setting up Link requests to responses scenario...");

        // Create pattern-specific components
        CorrelationIdentifierImplementation implementation = new CorrelationIdentifierImplementation();

        // Execute scenario
        implementation.processScenario("Link requests to responses");

        System.out.println("Link requests to responses completed successfully!");
    }

    /**
     * Demonstrates Session tracking.
     */
    private static void demonstrateSessiontracking() {
        System.out.println("Setting up Session tracking scenario...");

        // Create pattern-specific components
        CorrelationIdentifierImplementation implementation = new CorrelationIdentifierImplementation();

        // Execute scenario
        implementation.processScenario("Session tracking");

        System.out.println("Session tracking completed successfully!");
    }

}
