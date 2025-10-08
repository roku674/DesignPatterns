package Integration.MessageHistoryPattern;

/**
 * MessageHistoryPattern Pattern Demonstration
 *
 * Tracks messages through system
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== MessageHistoryPattern Pattern Demo ===\n");

        // Create implementation
        MessageHistoryPatternImpl implementation = new MessageHistoryPatternImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
