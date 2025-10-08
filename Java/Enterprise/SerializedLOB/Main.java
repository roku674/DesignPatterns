package Enterprise.SerializedLOB;

/**
 * SerializedLOB Pattern Demonstration
 *
 * Saves a graph of objects by serializing them into a single field
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== SerializedLOB Pattern Demo ===\n");

        // Create implementation
        SerializedLOBImpl implementation = new SerializedLOBImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
