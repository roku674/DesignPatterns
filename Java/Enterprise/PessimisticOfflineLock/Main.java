package Enterprise.PessimisticOfflineLock;

/**
 * PessimisticOfflineLock Pattern Demonstration
 *
 * Prevents conflicts by avoiding them with locks
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== PessimisticOfflineLock Pattern Demo ===\n");

        // Create implementation
        PessimisticOfflineLockImpl implementation = new PessimisticOfflineLockImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
