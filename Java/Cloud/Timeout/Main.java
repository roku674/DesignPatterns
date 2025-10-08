package Cloud.Timeout;

/**
 * Timeout Pattern Demonstration
 *
 * Sets time limits for operations
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Timeout Pattern Demo ===\n");

        // Create implementation
        TimeoutImpl implementation = new TimeoutImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
