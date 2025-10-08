package Integration.Splitter;

/**
 * Splitter Pattern Demonstration
 *
 * Breaks message into parts for separate processing
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Splitter Pattern Demo ===\n");

        // Create implementation
        SplitterImpl implementation = new SplitterImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
