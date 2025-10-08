package Cloud.RetryPattern;

/**
 * RetryPattern Pattern Demonstration
 *
 * Handles transient failures when connecting to service
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== RetryPattern Pattern Demo ===\n");

        // Create implementation
        RetryPatternImpl implementation = new RetryPatternImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
