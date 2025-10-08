package Integration.RecipientList;

/**
 * RecipientList Pattern Demonstration
 *
 * Routes message to list of recipients
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== RecipientList Pattern Demo ===\n");

        // Create implementation
        RecipientListImpl implementation = new RecipientListImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
