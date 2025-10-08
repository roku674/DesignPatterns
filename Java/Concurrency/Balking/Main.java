package Concurrency.Balking;

/**
 * Balking Pattern Demonstration
 *
 * Executes action only when object is in appropriate state
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== Balking Pattern Demo ===\n");

        // Create implementation
        BalkingImpl implementation = new BalkingImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
