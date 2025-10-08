package Integration.EnvelopeWrapper;

/**
 * EnvelopeWrapper Pattern Demonstration
 *
 * Wraps application data with routing information
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== EnvelopeWrapper Pattern Demo ===\n");

        // Create implementation
        EnvelopeWrapperImpl implementation = new EnvelopeWrapperImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
