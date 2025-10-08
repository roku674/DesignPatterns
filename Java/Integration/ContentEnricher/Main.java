package Integration.ContentEnricher;

/**
 * ContentEnricher Pattern Demonstration
 *
 * Adds missing information to messages
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ContentEnricher Pattern Demo ===\n");

        // Create implementation
        ContentEnricherImpl implementation = new ContentEnricherImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
