package Concurrency.ThreadSpecificStorage;

/**
 * ThreadSpecificStorage Pattern Demonstration
 *
 * Maintains thread-specific object storage
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ThreadSpecificStorage Pattern Demo ===\n");

        // Create implementation
        ThreadSpecificStorageImpl implementation = new ThreadSpecificStorageImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
