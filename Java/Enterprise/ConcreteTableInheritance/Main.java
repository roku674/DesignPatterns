package Enterprise.ConcreteTableInheritance;

/**
 * ConcreteTableInheritance Pattern Demonstration
 *
 * Maps each concrete class to its own table
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ConcreteTableInheritance Pattern Demo ===\n");

        // Create implementation
        ConcreteTableInheritanceImpl implementation = new ConcreteTableInheritanceImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
