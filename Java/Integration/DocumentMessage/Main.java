package Integration.DocumentMessage;

/**
 * DocumentMessage Pattern Demonstration
 *
 * Transfers data between applications
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== DocumentMessage Pattern Demo ===\n");

        // Create implementation
        DocumentMessageImpl implementation = new DocumentMessageImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
