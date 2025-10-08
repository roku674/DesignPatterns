package Enterprise.ImplicitLock;

/**
 * ImplicitLock Pattern Demonstration
 *
 * Manages locks implicitly without explicit lock calls
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ImplicitLock Pattern Demo ===\n");

        // Create implementation
        ImplicitLockImpl implementation = new ImplicitLockImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
