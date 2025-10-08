package Enterprise.OptimisticOfflineLock;

/**
 * OptimisticOfflineLock Pattern Demonstration
 *
 * Prevents conflicts by detecting them and rolling back
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== OptimisticOfflineLock Pattern Demo ===\n");

        // Create implementation
        OptimisticOfflineLockImpl implementation = new OptimisticOfflineLockImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
