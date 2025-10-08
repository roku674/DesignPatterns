package Microservices.APIComposition;

/**
 * APIComposition Pattern Demonstration
 *
 * Composes data from multiple services
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== APIComposition Pattern Demo ===\n");

        // Create implementation
        APICompositionImpl implementation = new APICompositionImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
