package Integration.ChannelAdapter;

/**
 * ChannelAdapter Pattern Demonstration
 *
 * Connects application to messaging system
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ChannelAdapter Pattern Demo ===\n");

        // Create implementation
        ChannelAdapterImpl implementation = new ChannelAdapterImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
