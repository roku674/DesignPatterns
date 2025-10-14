package Integration.PointToPointChannel;

/**
 * PointToPointChannel Pattern Demonstration
 *
 * Category: Message Channels
 *
 * Description:
 * Ensures message consumed by exactly one receiver
 *
 * Key Concepts:
 * - Enterprise integration pattern for messaging systems
 * - Enables loose coupling between distributed applications
 * - Supports asynchronous communication
 * - Provides reliability and scalability
 *
 * Real-world scenarios demonstrated:
 * 1. Order processing queue
 * 2. Job queue
 * 3. Task assignment
 * 4. Work distribution
 *
 * Reference: https://www.enterpriseintegrationpatterns.com
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== PointToPointChannel Pattern Demo ===\n");

        // Initialize messaging infrastructure
        System.out.println("Initializing PointToPointChannel infrastructure...\n");

        // Scenario 1: Order processing queue
        System.out.println("--- Scenario 1: Order processing queue ---");
        demonstrateOrderprocessingqueue();
        System.out.println();

        // Scenario 2: Job queue
        System.out.println("--- Scenario 2: Job queue ---");
        demonstrateJobqueue();
        System.out.println();

        // Scenario 3: Task assignment
        System.out.println("--- Scenario 3: Task assignment ---");
        demonstrateTaskassignment();
        System.out.println();

        // Scenario 4: Work distribution
        System.out.println("--- Scenario 4: Work distribution ---");
        demonstrateWorkdistribution();
        System.out.println();

        System.out.println("=== Pattern demonstration complete ===");
    }

    /**
     * Demonstrates Order processing queue.
     */
    private static void demonstrateOrderprocessingqueue() {
        System.out.println("Setting up Order processing queue scenario...");

        // Create pattern-specific components
        PointToPointChannelImplementation implementation = new PointToPointChannelImplementation();

        // Execute scenario
        implementation.processScenario("Order processing queue");

        System.out.println("Order processing queue completed successfully!");
    }

    /**
     * Demonstrates Job queue.
     */
    private static void demonstrateJobqueue() {
        System.out.println("Setting up Job queue scenario...");

        // Create pattern-specific components
        PointToPointChannelImplementation implementation = new PointToPointChannelImplementation();

        // Execute scenario
        implementation.processScenario("Job queue");

        System.out.println("Job queue completed successfully!");
    }

    /**
     * Demonstrates Task assignment.
     */
    private static void demonstrateTaskassignment() {
        System.out.println("Setting up Task assignment scenario...");

        // Create pattern-specific components
        PointToPointChannelImplementation implementation = new PointToPointChannelImplementation();

        // Execute scenario
        implementation.processScenario("Task assignment");

        System.out.println("Task assignment completed successfully!");
    }

    /**
     * Demonstrates Work distribution.
     */
    private static void demonstrateWorkdistribution() {
        System.out.println("Setting up Work distribution scenario...");

        // Create pattern-specific components
        PointToPointChannelImplementation implementation = new PointToPointChannelImplementation();

        // Execute scenario
        implementation.processScenario("Work distribution");

        System.out.println("Work distribution completed successfully!");
    }

}
