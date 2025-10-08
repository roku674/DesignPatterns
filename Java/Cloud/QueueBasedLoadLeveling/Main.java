package Cloud.QueueBasedLoadLeveling;

/**
 * QueueBasedLoadLeveling Pattern Demonstration
 *
 * Uses queue as buffer between task and service
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== QueueBasedLoadLeveling Pattern Demo ===\n");

        // Create implementation
        QueueBasedLoadLevelingImpl implementation = new QueueBasedLoadLevelingImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
