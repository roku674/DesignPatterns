package Integration.MessagingMapper;

/**
 * MessagingMapper Pattern Demonstration
 *
 * Moves data between domain objects and messaging
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== MessagingMapper Pattern Demo ===\n");

        // Create implementation
        MessagingMapperImpl implementation = new MessagingMapperImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
