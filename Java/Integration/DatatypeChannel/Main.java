package Integration.DatatypeChannel;

/**
 * DatatypeChannel Pattern Demonstration
 *
 * Uses separate channels for different data types
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== DatatypeChannel Pattern Demo ===\n");

        // Create implementation
        DatatypeChannelImpl implementation = new DatatypeChannelImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
