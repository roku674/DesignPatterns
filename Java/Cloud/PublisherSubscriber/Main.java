package Cloud.PublisherSubscriber;

/**
 * PublisherSubscriber Pattern Demonstration
 *
 * Enables asynchronous communication via messaging
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== PublisherSubscriber Pattern Demo ===\n");

        // Create implementation
        PublisherSubscriberImpl implementation = new PublisherSubscriberImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
