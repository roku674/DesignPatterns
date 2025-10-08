package Enterprise.EmbeddedValue;

/**
 * EmbeddedValue Pattern Demonstration
 *
 * Maps an object into several fields of another object's table
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== EmbeddedValue Pattern Demo ===\n");

        // Create implementation
        EmbeddedValueImpl implementation = new EmbeddedValueImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
