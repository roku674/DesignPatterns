package Integration.SamplingFilter;

/**
 * SamplingFilter Pattern Demonstration
 *
 * Samples subset of messages
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== SamplingFilter Pattern Demo ===\n");

        // Create implementation
        SamplingFilterImpl implementation = new SamplingFilterImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
