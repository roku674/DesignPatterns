package Integration.EventMessage;

/**
 * EventMessage Pattern Demonstration
 *
 * Notifies about an event that occurred
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== EventMessage Pattern Demo ===\n");

        // Create implementation
        EventMessageImpl implementation = new EventMessageImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
