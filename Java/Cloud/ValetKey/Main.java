package Cloud.ValetKey;

/**
 * ValetKey Pattern Demonstration
 *
 * Uses token to provide restricted direct access to resources
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ValetKey Pattern Demo ===\n");

        // Create implementation
        ValetKeyImpl implementation = new ValetKeyImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
