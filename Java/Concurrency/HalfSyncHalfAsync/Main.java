package Concurrency.HalfSyncHalfAsync;

/**
 * HalfSyncHalfAsync Pattern Demonstration
 *
 * Decouples async and sync service processing in concurrent systems
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== HalfSyncHalfAsync Pattern Demo ===\n");

        // Create implementation
        HalfSyncHalfAsyncImpl implementation = new HalfSyncHalfAsyncImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
