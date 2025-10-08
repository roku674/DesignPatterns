package Enterprise.SingleTableInheritance;

/**
 * SingleTableInheritance Pattern Demonstration
 *
 * Maps inheritance hierarchy to single table
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== SingleTableInheritance Pattern Demo ===\n");

        // Create implementation
        SingleTableInheritanceImpl implementation = new SingleTableInheritanceImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
