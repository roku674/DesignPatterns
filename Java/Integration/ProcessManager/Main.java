package Integration.ProcessManager;

/**
 * ProcessManager Pattern Demonstration
 *
 * Routes messages through multiple processing steps
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ProcessManager Pattern Demo ===\n");

        // Create implementation
        ProcessManagerImpl implementation = new ProcessManagerImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
