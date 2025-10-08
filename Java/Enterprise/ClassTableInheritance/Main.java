package Enterprise.ClassTableInheritance;

/**
 * ClassTableInheritance Pattern Demonstration
 *
 * Maps each class in hierarchy to its own table
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ClassTableInheritance Pattern Demo ===\n");

        // Create implementation
        ClassTableInheritanceImpl implementation = new ClassTableInheritanceImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
