package Integration.Resequencer;

/**
 * Resequencer Pattern Demonstration
 *
 * Converts stream of related messages to correct order
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Resequencer Pattern Demo ===\n");

        // Create implementation
        ResequencerImpl implementation = new ResequencerImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
