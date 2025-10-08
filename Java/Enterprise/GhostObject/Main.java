package Enterprise.GhostObject;

/**
 * GhostObject Pattern Demonstration
 *
 * Loads an object with partial data and loads full data on access
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== GhostObject Pattern Demo ===\n");

        // Create implementation
        GhostObjectImpl implementation = new GhostObjectImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
