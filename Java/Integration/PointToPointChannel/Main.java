package Integration.PointToPointChannel;

/**
 * PointToPointChannel Pattern Demonstration
 *
 * Delivers message to one receiver
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== PointToPointChannel Pattern Demo ===\n");

        // Create implementation
        PointToPointChannelImpl implementation = new PointToPointChannelImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
