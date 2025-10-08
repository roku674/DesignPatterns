package Enterprise.ValueObject;

/**
 * ValueObject Pattern Demonstration
 *
 * A small object whose equality is based on value, not identity
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ValueObject Pattern Demo ===\n");

        // Create implementation
        ValueObjectImpl implementation = new ValueObjectImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
