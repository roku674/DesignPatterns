package Cloud.CQRS;

/**
 * CQRS Pattern Demonstration
 *
 * Segregates read and update operations for a data store
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== CQRS Pattern Demo ===\n");

        // Create implementation
        CQRSImpl implementation = new CQRSImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
