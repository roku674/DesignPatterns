package Enterprise.IdentityField;

/**
 * IdentityField Pattern Demonstration
 *
 * Saves a database ID field in an object to maintain identity
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== IdentityField Pattern Demo ===\n");

        // Create implementation
        IdentityFieldImpl implementation = new IdentityFieldImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
