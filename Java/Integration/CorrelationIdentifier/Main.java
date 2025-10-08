package Integration.CorrelationIdentifier;

/**
 * CorrelationIdentifier Pattern Demonstration
 *
 * Marks request and reply messages
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== CorrelationIdentifier Pattern Demo ===\n");

        // Create implementation
        CorrelationIdentifierImpl implementation = new CorrelationIdentifierImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
