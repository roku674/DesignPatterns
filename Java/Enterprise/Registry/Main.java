package Enterprise.Registry;

/**
 * Registry Pattern Demonstration
 *
 * A well-known object that other objects can use to find services
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Registry Pattern Demo ===\n");

        // Create implementation
        RegistryImpl implementation = new RegistryImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
