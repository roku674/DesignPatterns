package Concurrency.ProactorPattern;

/**
 * ProactorPattern Pattern Demonstration
 *
 * Handles asynchronous operations without blocking
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ProactorPattern Pattern Demo ===\n");

        // Create implementation
        ProactorPatternImpl implementation = new ProactorPatternImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
