package Integration.HeaderEnricher;

/**
 * HeaderEnricher Pattern Demonstration
 *
 * Adds headers to messages
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== HeaderEnricher Pattern Demo ===\n");

        // Create implementation
        HeaderEnricherImpl implementation = new HeaderEnricherImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
