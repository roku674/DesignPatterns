package Concurrency.ReadWriteLock;

/**
 * ReadWriteLock Pattern Demonstration
 *
 * Allows concurrent read access while preserving exclusive write
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ReadWriteLock Pattern Demo ===\n");

        // Create implementation
        ReadWriteLockImpl implementation = new ReadWriteLockImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
