package Cloud.EventSourcing;

/**
 * EventSourcing Pattern Demonstration
 *
 * Uses append-only store to record full series of events
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== EventSourcing Pattern Demo ===\n");

        // Create implementation
        EventSourcingImpl implementation = new EventSourcingImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
