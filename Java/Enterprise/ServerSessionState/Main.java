package Enterprise.ServerSessionState;

/**
 * ServerSessionState Pattern Demonstration
 *
 * Stores session state on the server in memory
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ServerSessionState Pattern Demo ===\n");

        // Create implementation
        ServerSessionStateImpl implementation = new ServerSessionStateImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
