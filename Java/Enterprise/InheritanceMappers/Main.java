package Enterprise.InheritanceMappers;

/**
 * InheritanceMappers Pattern Demonstration
 *
 * Handles mapping for inheritance hierarchies
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== InheritanceMappers Pattern Demo ===\n");

        // Create implementation
        InheritanceMappersImpl implementation = new InheritanceMappersImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
