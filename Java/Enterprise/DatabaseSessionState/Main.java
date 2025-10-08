package Enterprise.DatabaseSessionState;

/**
 * DatabaseSessionState Pattern Demonstration
 *
 * Stores session state in a database
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== DatabaseSessionState Pattern Demo ===\n");

        // Create implementation
        DatabaseSessionStateImpl implementation = new DatabaseSessionStateImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
