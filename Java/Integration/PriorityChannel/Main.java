package Integration.PriorityChannel;

/**
 * PriorityChannel Pattern Demonstration
 *
 * Prioritizes messages
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== PriorityChannel Pattern Demo ===\n");

        // Create implementation
        PriorityChannelImpl implementation = new PriorityChannelImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
