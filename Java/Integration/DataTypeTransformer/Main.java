package Integration.DataTypeTransformer;

/**
 * DataTypeTransformer Pattern Demonstration
 *
 * Transforms message data types
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== DataTypeTransformer Pattern Demo ===\n");

        // Create implementation
        DataTypeTransformerImpl implementation = new DataTypeTransformerImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
