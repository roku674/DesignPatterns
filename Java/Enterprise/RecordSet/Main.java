package Enterprise.RecordSet;

/**
 * RecordSet Pattern Demonstration
 *
 * An in-memory representation of tabular data
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== RecordSet Pattern Demo ===\n");

        // Create implementation
        RecordSetImpl implementation = new RecordSetImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
