package Integration.FormatIndicator;

/**
 * FormatIndicator Pattern Demonstration
 *
 * Indicates message format for proper parsing
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== FormatIndicator Pattern Demo ===\n");

        // Create implementation
        FormatIndicatorImpl implementation = new FormatIndicatorImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
