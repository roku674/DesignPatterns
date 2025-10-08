package Enterprise.AssociationTableMapping;

/**
 * AssociationTableMapping Pattern Demonstration
 *
 * Maps associations using an intermediary table
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== AssociationTableMapping Pattern Demo ===\n");

        // Create implementation
        AssociationTableMappingImpl implementation = new AssociationTableMappingImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
