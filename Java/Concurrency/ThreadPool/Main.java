package Concurrency.ThreadPool;

/**
 * ThreadPool Pattern Demonstration
 *
 * Improves performance by managing a pool of worker threads
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ThreadPool Pattern Demo ===\n");

        // Create implementation
        ThreadPoolImpl implementation = new ThreadPoolImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
