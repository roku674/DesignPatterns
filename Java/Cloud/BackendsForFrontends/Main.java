package Cloud.BackendsForFrontends;

/**
 * BackendsForFrontends Pattern Demonstration
 *
 * Creates separate backend services for different frontends
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== BackendsForFrontends Pattern Demo ===\n");

        // Create implementation
        BackendsForFrontendsImpl implementation = new BackendsForFrontendsImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
