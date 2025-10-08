package Integration.MessageSequence;

/**
 * MessageSequence Pattern Demonstration
 *
 * Transmits large message in smaller chunks
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== MessageSequence Pattern Demo ===\n");

        // Create implementation
        MessageSequenceImpl implementation = new MessageSequenceImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
