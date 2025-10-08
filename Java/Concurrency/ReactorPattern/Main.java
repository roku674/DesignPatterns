package Concurrency.ReactorPattern;

/**
 * ReactorPattern Pattern Demonstration
 *
 * Handles service requests delivered concurrently
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ReactorPattern Pattern Demo ===\n");

        // Create implementation
        ReactorPatternImpl implementation = new ReactorPatternImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
