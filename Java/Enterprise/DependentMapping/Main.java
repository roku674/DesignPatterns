package Enterprise.DependentMapping;

/**
 * DependentMapping Pattern Demonstration
 *
 * Maps child objects that don't have their own table
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== DependentMapping Pattern Demo ===\n");

        // Create implementation
        DependentMappingImpl implementation = new DependentMappingImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
