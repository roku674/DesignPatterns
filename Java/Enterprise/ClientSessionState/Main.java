package Enterprise.ClientSessionState;

/**
 * ClientSessionState Pattern Demonstration
 *
 * Stores session state on the client
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ClientSessionState Pattern Demo ===\n");

        // Create implementation
        ClientSessionStateImpl implementation = new ClientSessionStateImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
