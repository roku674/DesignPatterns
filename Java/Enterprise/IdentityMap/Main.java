package Enterprise.IdentityMap;

/**
 * IdentityMap Pattern Demonstration
 *
 * Ensures each object gets loaded only once by keeping every loaded object in a map
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== IdentityMap Pattern Demo ===\n");

        // Create implementation
        IdentityMapImpl implementation = new IdentityMapImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
