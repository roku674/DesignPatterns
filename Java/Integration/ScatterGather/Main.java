package Integration.ScatterGather;

/**
 * ScatterGather Pattern Demonstration
 *
 * Broadcasts message and aggregates responses
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ScatterGather Pattern Demo ===\n");

        // Create implementation
        ScatterGatherImpl implementation = new ScatterGatherImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
