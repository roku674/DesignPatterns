package Enterprise.ApplicationController;

/**
 * ApplicationController Pattern Demonstration
 *
 * Centralizes retrieval and invocation of request-processing components
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("=== ApplicationController Pattern Demo ===\n");

        // Create implementation
        ApplicationControllerImpl implementation = new ApplicationControllerImpl();

        // Demonstrate pattern
        implementation.demonstrate();

        System.out.println("\nPattern demonstration complete.");
    }
}
