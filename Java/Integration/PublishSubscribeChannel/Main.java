package Integration.PublishSubscribeChannel;

/**
 * PublishSubscribeChannel Pattern Demonstration
 *
 * Delivers message to all subscribers
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== PublishSubscribeChannel Pattern Demo ===\n");

        // Create implementation
        PublishSubscribeChannelImpl implementation = new PublishSubscribeChannelImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
