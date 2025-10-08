package Concurrency.AsynchronousCompletionToken;

/**
 * AsynchronousCompletionToken Pattern Demonstration
 *
 * Allows efficient demuxing of asynchronous operations
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== AsynchronousCompletionToken Pattern Demo ===\n");

        // Create implementation
        AsynchronousCompletionTokenImpl implementation = new AsynchronousCompletionTokenImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
