package Integration.CanonicalDataModel;

/**
 * CanonicalDataModel Pattern Demonstration
 *
 * Uses common data model for all messages
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== CanonicalDataModel Pattern Demo ===\n");

        // Create implementation
        CanonicalDataModelImpl implementation = new CanonicalDataModelImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
