package Cloud.PriorityQueue;

/**
 * PriorityQueue Pattern Demonstration
 *
 * Prioritizes requests sent to services
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== PriorityQueue Pattern Demo ===\n");

        // Create implementation
        PriorityQueueImpl implementation = new PriorityQueueImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
