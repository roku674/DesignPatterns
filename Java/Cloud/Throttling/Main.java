package Cloud.Throttling;

/**
 * Throttling Pattern Demonstration
 *
 * Controls consumption of resources used by an application
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Throttling Pattern Demo ===\n");

        // Create implementation
        ThrottlingImpl implementation = new ThrottlingImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
