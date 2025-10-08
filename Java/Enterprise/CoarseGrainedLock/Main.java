package Enterprise.CoarseGrainedLock;

/**
 * CoarseGrainedLock Pattern Demonstration
 *
 * Locks a set of related objects with a single lock
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== CoarseGrainedLock Pattern Demo ===\n");

        // Create implementation
        CoarseGrainedLockImpl implementation = new CoarseGrainedLockImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
