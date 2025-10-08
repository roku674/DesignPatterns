package Integration.DurableSubscriber;

/**
 * DurableSubscriber Pattern Demonstration
 *
 * Maintains subscription while disconnected
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== DurableSubscriber Pattern Demo ===\n");

        // Create implementation
        DurableSubscriberImpl implementation = new DurableSubscriberImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
